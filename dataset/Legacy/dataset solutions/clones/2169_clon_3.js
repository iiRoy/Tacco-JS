function processInput(rawData) {
  var outputSegments = [];
  var sourceLength = rawData.length;
  var currentIdx;

  for (currentIdx = 0; currentIdx < sourceLength; currentIdx++) {
    outputSegments.push('x');
  }

  var constructedString = outputSegments.join('');
  console.log(constructedString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
