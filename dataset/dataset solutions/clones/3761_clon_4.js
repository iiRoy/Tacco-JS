let processInputData = (incomingTextValue) => {
  let numericValue = Number(incomingTextValue);
  let comparativeDelta = numericValue - 999;
  
  let outcomeLookup = ['ABC', 'ABC', 'ABD']; 
  
  let finalIndex = Math.sign(comparativeDelta) + 1; 
  
  process.stdout.write(outcomeLookup[finalIndex]);
};

let filesystemAccess = require("fs");
let rawInputData = filesystemAccess.readFileSync("/dev/stdin", "utf8");
processInputData(rawInputData);