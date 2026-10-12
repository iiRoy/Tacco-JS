function Main(inputContent) {
  const processedLines = inputContent.trim().split('\n');

  const parseNumbers = (lineString) => lineString.split(' ').map(Number);

  const [itemCount, selectionCount] = parseNumbers(processedLines[0]);
  const dataPoints = parseNumbers(processedLines[1]);

  const calculateTotal = (collection) => {
    let runningSum = 0;
    for (const value of collection) {
      runningSum += value;
    }
    return runningSum;
  };

  // Sort the data points in ascending order
  dataPoints.sort((valA, valB) => valA - valB);

  // Extract the 'selectionCount' largest elements.
  // Since dataPoints is sorted ascending, these are the last 'selectionCount' elements.
  const topElements = dataPoints.slice(-selectionCount);

  // The M-th largest element (which is the smallest among the top M)
  // is now at the first position of the 'topElements' array.
  const smallestOfTopM = topElements[0];

  const totalSum = calculateTotal(dataPoints);
  const thresholdValue = totalSum / (4 * selectionCount);

  // Determine the final verdict using a ternary operator
  const finalVerdict = (smallestOfTopM < thresholdValue) ? "No" : "Yes";

  console.log(finalVerdict);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
