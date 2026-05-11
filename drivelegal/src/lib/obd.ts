/**
 * LexDrive OBD-II Bridge
 * Connects to ELM327 BLE adapters via Web Bluetooth API.
 *
 * Supported adapters: any ELM327-compatible BLE OBD-II dongle
 * (Vgate iCar Pro BLE, OBDLINK CX, Veepeak OBDCheck BLE, etc.)
 *
 * Protocol: ELM327 AT commands over BLE UART service
 * Speed PID: 0x010D — Vehicle Speed (1 byte, km/h)
 *
 * Fallback: GPS watchPosition() when no OBD device is connected
 */

// Standard BLE UART service used by most ELM327 BLE adapters
const OBD_SERVICE_UUID  = "0000fff0-0000-1000-8000-00805f9b34fb";
const OBD_WRITE_UUID    = "0000fff2-0000-1000-8000-00805f9b34fb";
const OBD_NOTIFY_UUID   = "0000fff1-0000-1000-8000-00805f9b34fb";

// Some adapters use the generic Nordic UART service instead
const NORDIC_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_WRITE_UUID   = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_NOTIFY_UUID  = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

export type OBDStatus = "disconnected" | "connecting" | "connected" | "error" | "unsupported";

export interface OBDReading {
  speedKmh: number;
  source: "obd" | "gps";
}

type SpeedCallback = (reading: OBDReading) => void;
type StatusCallback = (status: OBDStatus) => void;

export class OBDManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private writeChar: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private notifyChar: any = null;
  private speedCallback: SpeedCallback | null = null;
  private statusCallback: StatusCallback | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private responseBuffer = "";
  private isInitialized = false;

  /** Check if Web Bluetooth is available in this browser */
  static isSupported(): boolean {
    return typeof navigator !== "undefined" &&
      "bluetooth" in navigator &&
      typeof (navigator as any).bluetooth?.requestDevice === "function"; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  onSpeed(cb: SpeedCallback) { this.speedCallback = cb; }
  onStatus(cb: StatusCallback) { this.statusCallback = cb; }

  private setStatus(s: OBDStatus) {
    this.statusCallback?.(s);
  }

  /** Request and connect to an ELM327 BLE OBD-II adapter */
  async connect(): Promise<boolean> {
    if (!OBDManager.isSupported()) {
      this.setStatus("unsupported");
      return false;
    }

    this.setStatus("connecting");

    try {
      // Request device — shows browser's native BLE picker
      this.device = await (navigator as any).bluetooth.requestDevice({ // eslint-disable-line @typescript-eslint/no-explicit-any
        filters: [
          { namePrefix: "OBDII" },
          { namePrefix: "OBD" },
          { namePrefix: "ELM" },
          { namePrefix: "Vgate" },
          { namePrefix: "iCar" },
          { namePrefix: "VEEPEAK" },
          { namePrefix: "LELink" },
          { namePrefix: "Carista" },
        ],
        optionalServices: [OBD_SERVICE_UUID, NORDIC_SERVICE_UUID]
      });

      this.device.addEventListener("gattserverdisconnected", () => {
        this.setStatus("disconnected");
        this.stopPolling();
      });

      const server = await this.device.gatt.connect();

      // Try standard FFF0 service first, then Nordic UART
      let service: any; // eslint-disable-line @typescript-eslint/no-explicit-any
      let writeUUID: string;
      let notifyUUID: string;

      try {
        service    = await server.getPrimaryService(OBD_SERVICE_UUID);
        writeUUID  = OBD_WRITE_UUID;
        notifyUUID = OBD_NOTIFY_UUID;
      } catch {
        service    = await server.getPrimaryService(NORDIC_SERVICE_UUID);
        writeUUID  = NORDIC_WRITE_UUID;
        notifyUUID = NORDIC_NOTIFY_UUID;
      }

      this.writeChar  = await service.getCharacteristic(writeUUID);
      this.notifyChar = await service.getCharacteristic(notifyUUID);

      // Subscribe to notifications (adapter sends responses here)
      await this.notifyChar.startNotifications();
      this.notifyChar.addEventListener("characteristicvaluechanged", (e: Event) => {
        const value = (e.target as any).value; // eslint-disable-line @typescript-eslint/no-explicit-any
        const chunk = new TextDecoder().decode(value);
        this.responseBuffer += chunk;
        this.parseBuffer();
      });

      // Initialize ELM327
      await this.sendCommand("ATZ");   // Reset
      await this.delay(1000);
      await this.sendCommand("ATE0");  // Echo off
      await this.sendCommand("ATL0");  // Linefeeds off
      await this.sendCommand("ATS0");  // Spaces off
      await this.sendCommand("ATH0");  // Headers off
      await this.sendCommand("ATSP0"); // Auto protocol

      this.isInitialized = true;
      this.setStatus("connected");

      // Start polling speed every 500ms
      this.startPolling();
      return true;

    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("OBD connect error:", err.message);
      this.setStatus(err.name === "NotFoundError" ? "disconnected" : "error");
      return false;
    }
  }

  /** Send raw AT/OBD command to adapter */
  private async sendCommand(cmd: string): Promise<void> {
    if (!this.writeChar) return;
    const encoded = new TextEncoder().encode(cmd + "\r");
    await this.writeChar.writeValue(encoded);
    await this.delay(100);
  }

  /** Parse accumulated response buffer for OBD speed response */
  private parseBuffer() {
    // OBD speed response for PID 010D looks like: "410D3C>" (3C hex = 60 km/h)
    const match = this.responseBuffer.match(/41\s*0D\s*([0-9A-Fa-f]{2})/);
    if (match) {
      const speedKmh = parseInt(match[1], 16);
      this.speedCallback?.({ speedKmh, source: "obd" });
      this.responseBuffer = "";
    }
    // Clear buffer if it gets too large (no valid response)
    if (this.responseBuffer.length > 200) {
      this.responseBuffer = "";
    }
  }

  /** Poll vehicle speed PID 010D every 500ms */
  private startPolling() {
    this.stopPolling();
    this.pollInterval = setInterval(async () => {
      if (!this.isInitialized || !this.writeChar) return;
      try {
        this.responseBuffer = "";
        await this.sendCommand("010D"); // Vehicle Speed PID
      } catch (err) {
        console.warn("OBD poll error:", err);
      }
    }, 500);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /** Disconnect from OBD adapter */
  async disconnect() {
    this.stopPolling();
    this.isInitialized = false;
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.writeChar = null;
    this.notifyChar = null;
    this.setStatus("disconnected");
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
