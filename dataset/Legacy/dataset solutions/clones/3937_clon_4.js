const isDebugMode = false;
const dataStream = isDebugMode
  ? "600\n300\n220\n420"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const processFinancialData = (payloadText) => {
  const collectedValues = [];
  let currentNumericSegment = "";
  for (let charIndex = 0; charIndex < payloadText.length; charIndex++) {
    const character = payloadText[charIndex];
    if (character >= '0' && character <= '9') {
      currentNumericSegment += character;
    } else if (currentNumericSegment !== "") {
      collectedValues.push(Number(currentNumericSegment));
      currentNumericSegment = "";
    }
  }
  if (currentNumericSegment !== "") {
    collectedValues.push(Number(currentNumericSegment));
  }

  const firstAmount = collectedValues[0];
  const secondAmount = collectedValues[1];
  const thirdAmount = collectedValues[2];
  const fourthAmount = collectedValues[3];

  const minimumOfFirstPair = Math.min(firstAmount, secondAmount);
  const minimumOfSecondPair = Math.min(thirdAmount, fourthAmount);

  console.log(minimumOfFirstPair + minimumOfSecondPair);
};

processFinancialData(dataStream);
