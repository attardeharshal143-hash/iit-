"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDriveContext } from "../context/DriveContext";

export default function GlobalCoPilot() {
  const { askCoPilot, isChatOpen, setIsChatOpen, appLanguage } = useDriveContext();
  const [messages, setMessages] = useState<{role:"user"|"ai",text:string}[]>([
    { role:"ai", text:"Hi! I am your AI Legal Co-Pilot. Ask me about traffic laws, fines, or your current speed." }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      if (!recognitionRef.current) {
        const r = new SR(); r.lang = appLanguage; r.continuous = false; r.interimResults = false;
        recognitionRef.current = r;
      } else {
        recognitionRef.current.lang = appLanguage;
      }
    }
  }, [appLanguage]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isChatOpen]);

  const handleSend = async (e?: React.FormEvent, custom?: string) => {
    if (e) e.preventDefault();
    const msg = (custom || input).trim();
    if (!msg) return;
    setMessages(p => [...p, { role:"user", text:msg }]);
    setInput("");
    setIsThinking(true);
    const reply = await askCoPilot(msg);
    setIsThinking(false);
    setMessages(p => [...p, { role:"ai", text:reply }]);
  };

  const startListening = () => {
    const r = recognitionRef.current;
    if (!r) return;
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (e: any) => handleSend(undefined, e.results[0][0].transcript);
    try { r.start(); } catch {}
  };

  if (!isChatOpen) return null;

  return (
    <div style={{ position:"fixed",bottom:"1.5rem",right:"1.5rem",zIndex:9000,width:380,maxWidth:"calc(100vw - 3rem)",height:520,background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"var(--radius-2xl)",boxShadow:"var(--shadow-2xl)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
      {/* Header */}
      <div style={{ padding:"1rem 1.25rem",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg-white)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.625rem" }}>
          <div style={{ width:32,height:32,borderRadius:"var(--radius-md)",background:"linear-gradient(135deg,var(--brand),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <div>
            <div style={{ fontWeight:700,fontSize:"0.9375rem",color:"var(--fg)",lineHeight:1.2 }}>AI Legal Co-Pilot</div>
            <div style={{ fontSize:"0.75rem",color:"var(--success)",fontWeight:500,display:"flex",alignItems:"center",gap:"0.25rem" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--success)",display:"inline-block" }} /> Online
            </div>
          </div>
        </div>
        <button onClick={() => setIsChatOpen(false)} style={{ width:32,height:32,borderRadius:"var(--radius-md)",border:"1px solid var(--border)",background:"var(--bg-subtle)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--fg-muted)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex:1,overflowY:"auto",padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.875rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role==="user" ? "flex-end" : "flex-start",maxWidth:"85%" }}>
            <div style={{ padding:"0.75rem 1rem",borderRadius: m.role==="user" ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",background: m.role==="user" ? "var(--brand)" : "var(--bg-subtle)",color: m.role==="user" ? "#fff" : "var(--fg)",fontSize:"0.9rem",lineHeight:1.55,border: m.role==="ai" ? "1px solid var(--border)" : "none",boxShadow:"var(--shadow-xs)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{ alignSelf:"flex-start",padding:"0.75rem 1rem",borderRadius:"var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",background:"var(--bg-subtle)",border:"1px solid var(--border)",display:"flex",gap:"4px",alignItems:"center" }}>
            {[0,1,2].map(i => <span key={i} style={{ width:6,height:6,borderRadius:"50%",background:"var(--fg-faint)",animation:`live-pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"1rem",borderTop:"1px solid var(--border)",background:"var(--bg-white)" }}>
        <form onSubmit={handleSend} style={{ display:"flex",gap:"0.5rem",alignItems:"center" }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={isListening ? "Listening..." : "Ask about fines, speed limits..."} className="input" style={{ flex:1,padding:"0.625rem 0.875rem",fontSize:"0.9rem" }} />
          <button type="button" onClick={startListening} style={{ width:38,height:38,borderRadius:"var(--radius-md)",border:"1px solid var(--border)",background: isListening ? "var(--danger-bg)" : "var(--bg-subtle)",color: isListening ? "var(--danger)" : "var(--fg-muted)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s ease" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button type="submit" style={{ width:38,height:38,borderRadius:"var(--radius-md)",border:"none",background:"var(--brand)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"var(--shadow-brand)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
