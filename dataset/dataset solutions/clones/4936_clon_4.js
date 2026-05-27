process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

inputReader.on('close', () => {
  const parsedNumbers = inputLines[0].split(' ').map(Number);
  const studentCount = parsedNumbers[0];
  const foreignQuota = parsedNumbers[1];
  const bQuota = parsedNumbers[2];

  const applicantTypes = inputLines[1].split('');

  const overallQuota = foreignQuota + bQuota;

  const processApplicant = (currentStatus, applicantType) => {
    let [passCount, bCount] = currentStatus;

    const outcomeMap = {
      'a': () => {
        if (passCount < overallQuota) {
          return ["Yes", passCount + 1, bCount];
        }
        return ["No", passCount, bCount];
      },
      'b': () => {
        if (passCount < overallQuota && bCount <= bQuota) {
          return ["Yes", passCount + 1, bCount + 1];
        }
        return ["No", passCount, bCount];
      },
      'c': () => ["No", passCount, bCount]
    };

    const actionHandler = outcomeMap[applicantType] || (() => ["No", passCount, bCount]);
    const [displayMessage, updatedPassCount, updatedBCount] = actionHandler();
    
    console.log(displayMessage);
    
    return [updatedPassCount, updatedBCount];
  };

  applicantTypes.reduce(processApplicant, [0, 1]);
});
