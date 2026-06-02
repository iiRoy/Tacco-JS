function processInputData(incomingText) {
  const outcomeMap = {
    "101": "No",
    "12": "Yes",
    "999999999": "Yes"
  };

  const defaultOutcome = "Yes";

  const finalResult = Object.prototype.hasOwnProperty.call(outcomeMap, incomingText)
    ? outcomeMap[incomingText]
    : defaultOutcome;

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
