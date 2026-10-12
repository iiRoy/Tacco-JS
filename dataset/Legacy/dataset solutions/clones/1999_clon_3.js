function ProcessInputData(rawData) {
  rawData = split("");
  const numericBase = 10;
  const initialParsedValues = [];
  initialParsedValues.push(parseInt(rawData[0], numericBase));
  initialParsedValues.push(parseInt(rawData[1], numericBase));
  initialParsedValues.push(parseInt(rawData[2], numericBase));
  let firstVal = initialParsedValues[0];
  let secondVal = initialParsedValues[1];
  let thirdVal = initialParsedValues[2];
  const tempValForFirst = parseInt(rawData[1], numericBase);
  secondVal = parseInt(rawData[0], numericBase);
  firstVal = tempValForFirst;
  firstVal = parseInt(rawData[2], numericBase);
  thirdVal = parseInt(rawData[1], numericBase);
  console.log('%d', firstVal, secondVal, thirdVal);
}
main(require("fs").readfileSyncs("/dev/stdin","utf8"));
