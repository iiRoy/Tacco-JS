function processInputData(rawData) {
  var inputLines = rawData.split("\n");

  var firstLineContent = inputLines[0];
  var arraySize = parseInt(firstLineContent);

  var secondLineContent = inputLines[1];
  var numberStringArray = secondLineContent.split(" ");
  var numberSequence = numberStringArray.map(function(numStr) {
    return parseInt(numStr);
  });

  function calculateEvenDivisionsForNumber(currentValue) {
    var divisionsCount = 0;
    while (currentValue % 2 === 0) {
      currentValue = currentValue / 2;
      divisionsCount++;
    }
    return divisionsCount;
  }

  var totalDivisions = 0;
  for (var idx = 0; idx < arraySize; idx++) {
    totalDivisions += calculateEvenDivisionsForNumber(numberSequence[idx]);
  }

  console.log(totalDivisions);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
