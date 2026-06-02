process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  var initialParams = inputLines[0].split(' ');
  var totalStudents = parseInt(initialParams[0], 10);
  var passLimitA = parseInt(initialParams[1], 10);
  var passLimitB = parseInt(initialParams[2], 10);

  const overallPassThreshold = passLimitA + passLimitB;

  var passedCount = 0;
  var bPassedCount = 0; // Initialized to 0, equivalent to original 'ab' starting at 1 with adjusted condition

  var studentResults = inputLines[1].split('');

  // Helper function to determine if a student is eligible to pass based on current counts and limits
  const checkStudentEligibility = (studentCategory, currentOverallPasses, currentBPasses, maxOverallPasses, maxBStudents) => {
    if (studentCategory === 'c') {
      return false;
    }
    if (studentCategory === 'a') {
      return currentOverallPasses < maxOverallPasses;
    }
    if (studentCategory === 'b') {
      // Original: pass < a+b && b >= ab
      // Equivalent with bPassedCount (starts at 0) and maxBStudents (passLimitB):
      // currentOverallPasses < maxOverallPasses && currentBPasses < maxBStudents
      // This allows exactly 'maxBStudents' of type 'b' to pass.
      return currentOverallPasses < maxOverallPasses && currentBPasses < maxBStudents;
    }
    return false; // Should not be reached with 'a', 'b', 'c' categories
  };

  for (let studentIndex = 0; studentIndex < totalStudents; studentIndex++) {
    const currentStudentType = studentResults[studentIndex];

    let studentIsEligible = checkStudentEligibility(
      currentStudentType,
      passedCount,
      bPassedCount,
      overallPassThreshold,
      passLimitB
    );

    if (studentIsEligible) {
      console.log("Yes");
      passedCount++;
      if (currentStudentType === 'b') {
        bPassedCount++;
      }
    } else {
      console.log("No");
    }
  }
});
