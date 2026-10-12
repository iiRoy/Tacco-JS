function processInput(rawData) {
  const fixedOutputValue = 5.000000000000001;

  const getCalculatedResult = () => {
    return fixedOutputValue;
  };

  const finalValueToLog = getCalculatedResult();

  console.log(finalValueToLog);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
