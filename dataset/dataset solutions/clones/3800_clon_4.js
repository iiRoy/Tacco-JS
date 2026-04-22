function DataProcessor(rawContent) {
  const lines = rawContent.split('\n');
  const totalElements = Number(lines[0]);
  const numericSequence = lines[1].split(' ').map(Number);

  let validSubarrayCount = 0;
  let leftPointer = 0;
  let currentXORAccumulator = 0;

  for (let rightPointer = 0; rightPointer < totalElements; ++rightPointer) {
    while ((currentXORAccumulator & numericSequence[rightPointer]) !== 0) {
      currentXORAccumulator ^= numericSequence[leftPointer];
      leftPointer++;
    }
    
    currentXORAccumulator ^= numericSequence[rightPointer];
    validSubarrayCount += (rightPointer - leftPointer + 1);
  }

  console.log('%s', validSubarrayCount);
}
  
function DebuggingUtility(){
  const userTextInput = document.getElementById("input").value;
  DataProcessor(userTextInput);
}

DataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));