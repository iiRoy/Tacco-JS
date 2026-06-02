var initialData = "3\n101 9901 999999000001";

function processInputData(rawData) {
  var numberStrings = rawData.split("\n")[1];
  numberStrings = numberStrings.split(" ");
  var currentProduct = numberStrings[0];
  for (var index = 1; index < numberStrings.length; index++) {
    currentProduct = (BigInt(currentProduct) * BigInt(numberStrings[index]));
  }
  if (currentProduct > Math.pow(10, 18)) {
    console.log(-1);
  } else {
    console.log(currentProduct);
  }
}
processInputData(initialData);
