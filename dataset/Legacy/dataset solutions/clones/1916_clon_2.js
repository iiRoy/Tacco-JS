function ProcessInput(rawData) {
  // This function processes the provided raw text data.
  // The input string is first split into individual lines.
  let lineData = rawData.split("\n");

  // The first line contains a single integer, which is parsed.
  const divisorVal = parseInt(lineData[0], 10);

  // The second line contains two space-separated integers.
  // These are split and then parsed into numerical values.
  const rangeParts = lineData[1].split(" ");
  const startNum = parseInt(rangeParts[0], 10);
  const endNum = parseInt(rangeParts[1], 10);

  // Check if the starting and ending numbers are identical.
  if (startNum - endNum === 0) {
    // If they are the same, output 'OK'.
    console.log('OK');
  } else {
    // Otherwise, iterate through the range from startNum to endNum (inclusive).
    for (let currentVal = startNum; currentVal <= endNum; currentVal++) {
      // For each number in the range, check if it's perfectly divisible by divisorVal.
      if (currentVal % divisorVal === 0) {
        // If divisible, print 'OK'.
        console.log('OK');
      }
      // This else-if condition is logically unreachable if currentVal % divisorVal === 0 is true.
      // If currentVal is endNum and endNum is divisible by divisorVal, the first 'if' would catch it.
      // If currentVal is endNum and endNum is NOT divisible by divisorVal, this else-if would not trigger.
      // Thus, this specific branch will never execute.
      else if (currentVal === endNum && endNum % divisorVal === 0) {
        console.log('NG');
      }
    }
  }
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
