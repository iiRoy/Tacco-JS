const dataMutator = (incomingString) => {
  const codePairs = new Map([
    ["ABC", "ARC"],
    ["ARC", "ABC"]
  ]);
  return codePairs.get(incomingString);
};

const executionWrapper = (dataSourceContent) => {
  const alteredValue = dataMutator(dataSourceContent.trim());
  alteredValue && console.log(alteredValue);
};

executionWrapper(require("fs").readFileSync("/dev/stdin", "utf8"));