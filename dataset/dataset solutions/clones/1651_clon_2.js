// This function processes the entire incoming stream of characters
function ProcessData(incomingContent) {

  incomingContent = incomingContent.split("\n");

  const paramLine = incomingContent[0].split(" ");
  let itemCount = parseInt(paramLine[0], 10);
  let groupSize = parseInt(paramLine[1], 10);

  const valueSegments = incomingContent[1].split(" ");


  let productSeries = [];
  let runningProduct = 0;

  for (let outerIndex = 0; outerIndex <= itemCount; outerIndex++) {

    if (outerIndex >= groupSize) {
      for (let innerIndex = outerIndex - groupSize; innerIndex < outerIndex; innerIndex++) {
        let numericEntry = parseInt(valueSegments[innerIndex], 10);
        if (runningProduct === 0) {
          runningProduct = numericEntry;
        } else {
          runningProduct = runningProduct * numericEntry;
        }
      }
      productSeries.push(runningProduct);
      runningProduct = 0;
    }

  }

  let verdictList = [];
  let currentValue = 0;
  let priorItem = 0;

  for (let comparisonIndex = 0; comparisonIndex < productSeries.length; comparisonIndex++) {
    currentValue = productSeries[comparisonIndex];
    if (comparisonIndex > 0) {
      if (priorItem < currentValue) {
        verdictList.push('Yes');
      } else {
        verdictList.push('No');
      }
    }
    priorItem = productSeries[comparisonIndex];
  }

  for (let outputIndex = 0; outputIndex < verdictList.length; outputIndex++) {
    // Display the computed outcome
    console.log(verdictList[outputIndex]);
  }
}


ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));