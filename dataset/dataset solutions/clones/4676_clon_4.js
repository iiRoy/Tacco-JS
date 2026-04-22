function processBinaryInput(dataString) {
  const inputElements = dataString.split(" ");
  const elementA = inputElements[0];
  const elementB = inputElements[1];

  const decisionMatrix = {
    "H": {
      "H": "H",
      "D": "D"
    },
    "D": {
      "H": "D",
      "D": "H"
    }
  };

  const outcomeSymbol = decisionMatrix[elementA][elementB];

  console.log('%s', outcomeSymbol);
}
  
function testWithBrowserInput(){
  const testValue = document.getElementById("sourceInput").value;
  processBinaryInput(testValue);
}

function runProcessorFromStdin() {
  const standardInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
  processBinaryInput(standardInput);
}

runProcessorFromStdin();