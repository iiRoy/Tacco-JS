function processInputData(rawData) {
  var parsedData = rawData.split(" ");
  var firstVal = parsedData[0];
  var secondVal = parsedData[1];

  let sumOperationResult = firstVal + secondVal;
  let differenceOperationResult = firstVal - secondVal;
  let productOperationResult = firstVal * secondVal;

  let maximumCalculatedValue = math.max(sumOperationResult, differenceOperationResult, productOperationResult);

  console.log(maximumCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
