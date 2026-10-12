const ELLIPSIS_INDICATOR = '...';

const getTruncatedString = (textValue, charLimit) => {
  const currentLength = textValue.length;
  const shouldTruncate = currentLength > charLimit;

  if (shouldTruncate) {
    const slicedPart = textValue.slice(0, charLimit);
    return slicedPart + ELLIPSIS_INDICATOR;
  } else {
    return textValue;
  }
};

function processInputData(rawInputContent) {
  const parsedLines = rawInputContent.split("\n");

  const maxDisplayLength = Number.parseInt(parsedLines[0], 10);
  const sourceString = parsedLines[1];

  const finalOutput = getTruncatedString(sourceString, maxDisplayLength);
  console.log(finalOutput);
}

function executeDebugRoutine() {
  var debugInput = document.getElementById("input").value;
  processInputData(debugInput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
