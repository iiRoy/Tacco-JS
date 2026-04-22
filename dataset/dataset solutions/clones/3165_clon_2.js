function ProcessInput(rawData) {
  rawData = rawData.split("\n") ;
  const dateParts = rawData[0].split("/");
  let eraName = "Heisei";

  if ( parseInt(dateParts[0]) >= 2020 || ( parseInt(dateParts[0]) >= 2019 && parseInt(dateParts[1]) >= 5 ) ) {
    eraName = "TBD";
  }

  console.log('%s', eraName);
  return eraName;
}

// This utility function is for local debugging purposes.
function testInput(testCaseIndex) {
  const testValue = document.getElementById(`testData${testCaseIndex}`).value;
  ProcessInput(testValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));