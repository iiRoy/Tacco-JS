function processInputString(inputStringValue) {
  let diffCount = 0;
 
  const stringLength = inputStringValue.length;
  const lastCharIndex = stringLength - 1;
  
  // The loop iterates through the first half of the string,
  // comparing characters with their symmetric counterparts from the end.
  // For an odd length string, the middle character is not compared against itself.
  const comparisonIterations = Math.floor(stringLength / 2); 

  for (let leftPointer = 0; leftPointer < comparisonIterations; leftPointer++) {
    const rightPointer = lastCharIndex - leftPointer;
    
    if (inputStringValue[leftPointer] !== inputStringValue[rightPointer]) {
      diffCount++;
    }
  }
 
  console.log(diffCount);
}
 
processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
