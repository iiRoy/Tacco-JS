const classificationRules = [
  { start: 400, end: 599, outcome: '8' },
  { start: 600, end: 799, outcome: '7' },
  { start: 800, end: 999, outcome: '6' },
  { start: 1000, end: 1199, outcome: '5' },
  { start: 1200, end: 1399, outcome: '4' },
  { start: 1400, end: 1599, outcome: '3' },
  { start: 1600, end: 1799, outcome: '2' },
  { start: 1800, end: 1999, outcome: '1' }
];

function EvaluateNumber(dataString) {
  const parsedValue = parseInt(dataString.trim(), 10);
  
  const foundOutcome = classificationRules.find(rule => 
    parsedValue >= rule.start && parsedValue <= rule.end
  );

  if (foundOutcome) {
    process.stdout.write(foundOutcome.outcome + '\n');
  }
}

const getFileContent = require("fs").readFileSync;
EvaluateNumber(getFileContent("/dev/stdin", "utf8"));