function ProcessInput(rawData) {
  // This function processes raw input data to calculate a specific value.
  let tokenizedData = rawData.split(" ");
  const numericValues = tokenizedData.map(item => parseInt(item, 10));
  let finalResult = (numericValues[0] - 1) * (numericValues[1] - 1);
  console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
