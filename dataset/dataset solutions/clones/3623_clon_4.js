function processNumericSequence(sourceData) {
  var numericalValue = parseInt(sourceData.substring(0, sourceData.indexOf('\n')), 10);
  var derivedRemainder = numericalValue % 11;

  var permissibleRemainders = [0, 4, 7];

  var remainderCheckFunction = function(currentRemainder) {
    return permissibleRemainders.includes(currentRemainder);
  };

  var outcomeMapping = {
    "true": "Yes",
    "false": "No"
  };

  console.log(outcomeMapping[remainderCheckFunction(derivedRemainder).toString()]);
}

processNumericSequence(require("fs").readFileSync("/dev/stdin","utf8"));