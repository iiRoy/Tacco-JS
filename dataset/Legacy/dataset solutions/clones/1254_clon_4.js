var dataBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(segment) {
  dataBuffer += segment;
});

process.stdin.on('end', function() {
  var lines = dataBuffer.split("\n");
  var numericStrings = lines[1].split(" ");

  let initialAggregates = {
    minimumValue: Infinity,
    maximumValue: -Infinity,
    cumulativeSum: 0
  };

  let finalAggregates = numericStrings.reduce((currentAggregates, stringElement) => {
    let parsedNumber = Number(stringElement);
    currentAggregates.minimumValue = Math.min(currentAggregates.minimumValue, parsedNumber);
    currentAggregates.maximumValue = Math.max(currentAggregates.maximumValue, parsedNumber);
    currentAggregates.cumulativeSum += parsedNumber;
    return currentAggregates;
  }, initialAggregates);

  console.log(finalAggregates.minimumValue + " " + finalAggregates.maximumValue + " " + finalAggregates.cumulativeSum);
});
