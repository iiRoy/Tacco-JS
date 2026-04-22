const mirrorString = (inputVal) => [...inputVal].reduceRight((acc, char) => acc + char, '');

const checkReflection = (textSegment) => mirrorString(textSegment) === textSegment;

const evaluateComplexPalindrome = (primaryText) => {
  const totalLength = primaryText.length;

  const firstCondition = checkReflection(primaryText);

  const subSegmentOneEnd = Math.floor((totalLength - 1) / 2);
  const subSegmentOne = primaryText.slice(0, subSegmentOneEnd);
  const secondCondition = checkReflection(subSegmentOne);

  const subSegmentTwoStart = Math.floor((totalLength + 3) / 2);
  const subSegmentTwoEnd = totalLength - 1;
  const subSegmentTwo = primaryText.slice(subSegmentTwoStart, subSegmentTwoEnd);
  const thirdCondition = checkReflection(subSegmentTwo);

  return firstCondition && secondCondition && thirdCondition;
};

const inputProcessor = (incomingData) => {
  const processedText = String(incomingData);

  console.log(mirrorString(processedText));

  if (evaluateComplexPalindrome(processedText)) {
    console.log("Yes");
  } else {
    console.log("No");
  }
};

inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));