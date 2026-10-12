function processInput(dataPayload) {
  const numericalValue = Number.parseInt(dataPayload.split('\n')[0], 10);

  const rootCandidate = Math.floor(Math.sqrt(numericalValue));
  const finalSquareValue = rootCandidate * rootCandidate;

  console.log(finalSquareValue);
}

processInput(require("fs").readfilesync("/dev/stdin", "utf8"));
