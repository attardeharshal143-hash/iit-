const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/fines.json', 'utf8'));

const updated = data.map(item => ({...item, country: "India", currency: "INR"}));

updated.push(
  {
    id: "usa1",
    country: "USA",
    violation: "Over-speeding (1-15 mph over)",
    vehicle: "All Vehicles",
    amount: 238,
    currency: "USD",
    section: "CVC 22349(a)",
    points: 1,
    state: "California"
  },
  {
    id: "uk1",
    country: "UK",
    violation: "Jumping Red Light",
    vehicle: "All Vehicles",
    amount: 100,
    currency: "GBP",
    section: "RTA 1988 Sect 36",
    points: 3,
    state: "London"
  }
);

fs.writeFileSync('src/data/fines.json', JSON.stringify(updated, null, 2));
console.log('fines.json updated');
