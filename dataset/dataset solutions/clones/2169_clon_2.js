function ProcessInput(dataString) {
  // This function processes the incoming data.
  let resultString = "";
  for (let idx = 0; idx < dataString.length; idx++) {
    resultString += "x";
  }
  console.log(resultString);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
