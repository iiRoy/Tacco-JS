const rawData = require('fs').readFileSync('/dev/stdin', 'UTF-8');

const generateRectangleString = (heightDimension, widthDimension) => {
  // Helper function to construct a single rectangle's string representation.
  // It handles edge cases where dimensions might be non-positive by returning an empty string,
  // which aligns with the behavior of Array(n).join('') for n=1 (for height=0)
  // or Array(n).join('#') for n=1 (for width=0).
  if (heightDimension <= 0 || widthDimension <= 0) {
    // For example, if heightDimension is 0, Array(1).join(...) is an empty string.
    // If widthDimension is 0, Array(1).join('#') is an empty string.
    // This explicit check ensures clarity, though the Array.join logic handles it implicitly.
    return '';
  }

  const hashRowContent = Array(widthDimension + 1).join('#');
  const rowWithLineBreak = hashRowContent + '\n';
  const finalRectangleOutput = Array(heightDimension + 1).join(rowWithLineBreak);
  return finalRectangleOutput;
};

const renderRectangles = (sourceData) => {
  const lineSegments = sourceData.split(`\n`);

  for (let idx = 0; idx < lineSegments.length; idx++) {
    const currentLine = lineSegments[idx];
    const dimensionValues = currentLine.split(' ').map(Number);

    const heightVal = dimensionValues[0];
    const widthVal = dimensionValues[1];

    // Exit condition as per original logic
    if (heightVal === 0 && widthVal === 0) {
      return false;
    }

    const rectangleOutput = generateRectangleString(heightVal, widthVal);
    console.log(rectangleOutput);
  }
};

renderRectangles(rawData);
