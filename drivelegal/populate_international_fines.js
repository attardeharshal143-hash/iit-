const fs = require('fs');
let data = JSON.parse(fs.readFileSync('src/data/fines.json', 'utf8'));

// Filter out the two mock entries we added previously
data = data.filter(d => d.id !== 'usa1' && d.id !== 'uk1');

const internationalFines = [
  // USA
  { id: "usa1", country: "USA", violation: "Running a Red Light", vehicle: "All Vehicles", amount: 490, currency: "USD", section: "CVC 21453(a)", points: 1, state: "California" },
  { id: "usa2", country: "USA", violation: "DUI (First Offense)", vehicle: "All Vehicles", amount: 1000, currency: "USD", section: "CVC 23152", points: 2, state: "California", consequence: "Up to 6 months jail, license suspension" },
  { id: "usa3", country: "USA", violation: "Speeding (1-15 mph over)", vehicle: "All Vehicles", amount: 238, currency: "USD", section: "CVC 22349(a)", points: 1, state: "California" },
  { id: "usa4", country: "USA", violation: "Texting While Driving", vehicle: "All Vehicles", amount: 162, currency: "USD", section: "CVC 23123.5", points: 1, state: "California" },
  { id: "usa5", country: "USA", violation: "Speeding (10% over limit)", vehicle: "All Vehicles", amount: 200, currency: "USD", section: "NY VTL 1180", points: 3, state: "New York" },
  
  // UK
  { id: "uk1", country: "UK", violation: "Speeding (Fixed Penalty)", vehicle: "All Vehicles", amount: 100, currency: "GBP", section: "RTA 1988 Sect 89", points: 3, state: "England & Wales" },
  { id: "uk2", country: "UK", violation: "Using Mobile Phone", vehicle: "All Vehicles", amount: 200, currency: "GBP", section: "RTA 1988 Sect 41D", points: 6, state: "England & Wales" },
  { id: "uk3", country: "UK", violation: "Drink Driving", vehicle: "All Vehicles", amount: 2500, currency: "GBP", section: "RTA 1988 Sect 5", points: 11, state: "England & Wales", consequence: "Disqualification from driving" },
  { id: "uk4", country: "UK", violation: "Careless Driving", vehicle: "All Vehicles", amount: 100, currency: "GBP", section: "RTA 1988 Sect 3", points: 3, state: "England & Wales" },
  
  // UAE
  { id: "uae1", country: "UAE", violation: "Jumping Red Light", vehicle: "Light Vehicle", amount: 1000, currency: "AED", section: "Federal Traffic Law", points: 12, state: "Dubai", consequence: "Vehicle impounded for 30 days" },
  { id: "uae2", country: "UAE", violation: "Speeding (more than 80km/h over)", vehicle: "All Vehicles", amount: 3000, currency: "AED", section: "Federal Traffic Law", points: 23, state: "Dubai", consequence: "Vehicle impounded for 60 days" },
  { id: "uae3", country: "UAE", violation: "Driving under influence of alcohol", vehicle: "All Vehicles", amount: 20000, currency: "AED", section: "Federal Traffic Law", points: 23, state: "Dubai", consequence: "Decided by court, vehicle impound 60 days" },
  
  // Australia
  { id: "aus1", country: "Australia", violation: "Speeding (less than 10km/h over)", vehicle: "All Vehicles", amount: 302, currency: "AUD", section: "Road Safety Rules 2017", points: 1, state: "New South Wales" },
  { id: "aus2", country: "Australia", violation: "Using mobile phone while driving", vehicle: "All Vehicles", amount: 387, currency: "AUD", section: "Road Safety Rules 2017", points: 5, state: "New South Wales" },
  { id: "aus3", country: "Australia", violation: "Not wearing a seatbelt", vehicle: "All Vehicles", amount: 387, currency: "AUD", section: "Road Safety Rules 2017", points: 3, state: "New South Wales" },
  
  // Germany
  { id: "ger1", country: "Germany", violation: "Speeding (21-25 km/h over in city)", vehicle: "All Vehicles", amount: 115, currency: "EUR", section: "StVO", points: 1, state: "Federal" },
  { id: "ger2", country: "Germany", violation: "Tailgating (at over 130 km/h)", vehicle: "All Vehicles", amount: 400, currency: "EUR", section: "StVO", points: 2, state: "Federal", consequence: "Driving ban for 3 months" },
  { id: "ger3", country: "Germany", violation: "DUI (0.5 to 1.09 per mille)", vehicle: "All Vehicles", amount: 500, currency: "EUR", section: "StVG § 24a", points: 2, state: "Federal", consequence: "1 month driving ban" }
];

const combined = [...data, ...internationalFines];
fs.writeFileSync('src/data/fines.json', JSON.stringify(combined, null, 2));
console.log('International fines added successfully.');
