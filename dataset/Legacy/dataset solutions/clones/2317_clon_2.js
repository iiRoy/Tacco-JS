function ProcessInput(rawData) {
  // This function processes the incoming data stream.
  rawData = rawData.split("\n").map(item => parseInt(item));

  console.log(6 - rawData[0] - rawData[1]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
