function processInputData(rawData) {
  const parsedSegments = rawData.split(" ");
  const firstSegment = parsedSegments[0];
  const secondSegment = parsedSegments[1];

  let resultStringValue;

  const isFirstCharH = (firstSegment === "H");
  const isSecondCharH = (secondSegment === "H");

  if (isFirstCharH) {
    if (isSecondCharH) {
      resultStringValue = "H";
    } else {
      resultStringValue = "D";
    }
  } else {
    if (isSecondCharH) {
      resultStringValue = "D";
    } else {
      resultStringValue = "H";
    }
  }

  console.log('%s', resultStringValue);
}

function runDebugSimulation(){
  const debugInput = document.getElementById("input").value;
  processInputData(debugInput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
