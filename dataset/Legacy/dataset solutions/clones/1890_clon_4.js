const processInput = (sourceData) => {
  const transformationRules = {
    "ABC": "ARC",
    "ARC": "ABC"
  };

  const resultValue = transformationRules[sourceData];

  if (resultValue !== undefined) {
    console.log(resultValue);
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
