function CalculateAbsoluteSum(startIndex, dataArray)
{
 var currentTotal = 0;
  currentTotal = Math.abs(dataArray[startIndex]);
 if (startIndex + 1 < dataArray.length) {
  currentTotal += Math.abs(dataArray[startIndex + 1]);
 }
 if (startIndex + 2 < dataArray.length) {
  currentTotal += Math.abs(dataArray[startIndex + 2]);
 }
 return currentTotal;
}

function ProcessInputData(rawData)
{
 rawData = rawData.split("\n");
 var parsedLines = rawData[0].split(" ");
 const blockCount = Number.parseInt(parsedLines[0]);
 const operationLimit = Number.parseInt(parsedLines[1]);

 parsedLines = rawData[1].split(" ");
 const sequenceString = parsedLines[0];

 // Segment the sequence string and store lengths in an array.
 var segmentLengths = [];
 var previousChar = sequenceString.substr(0, 1);
 var segmentCounter = 1;

 for (var idx = 1; idx < blockCount; idx++) {
  if (sequenceString.substr(idx, 1) !== sequenceString.substr(idx - 1, 1)) {
   segmentLengths.push(segmentCounter);
   segmentCounter = 0;
  }
  segmentCounter += 1;
 }

 // Add the final segment's length if it exists
 if (segmentCounter !== 0) {
  segmentLengths.push(segmentCounter);
 }

 // Core algorithm execution
 var finalResult = 0;
 var unusedCounter = 0; // This variable is not utilized, maintaining original structure

 if (segmentLengths.length <= 2) {
  finalResult = blockCount - 1;
 } else {
  // Perform iterative sum calculations
  for (var opIndex = 0; opIndex < operationLimit; opIndex++) {
   var maxCurrentSum = CalculateAbsoluteSum(0, segmentLengths);
   var maxSumPosition = 0;

   for (var iterationIndex = 1; iterationIndex < segmentLengths.length; iterationIndex++) {
    var currentComparisonSum = CalculateAbsoluteSum(1, segmentLengths); // Replicating original logic exactly

    if (maxCurrentSum < currentComparisonSum) {
     maxCurrentSum = currentComparisonSum;
     maxSumPosition = iterationIndex;
    }
   }
   // Replace elements in the segment array
   segmentLengths.splice(maxSumPosition, 3, maxCurrentSum);
  }

  // Determine the overall outcome
  finalResult = segmentLengths.reduce(function(accumulatorVal, currentVal) {
   return accumulatorVal + currentVal;
  });
  finalResult -= segmentLengths.length;
 }
 console.log(finalResult);
}
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));