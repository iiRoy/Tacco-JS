const processInput = (dataPayload) => {
  const [firstToken, secondToken] = dataPayload.split(/\s+/);
  const limitConstant = 100;

  const valueIdentifierString = Number(secondToken) <= limitConstant ? secondToken : limitConstant = 100;

  const determineOutput = (iterationCountStr, identifierValue) => {
    const checkCondition = (currentCount) => {
      const specificMatch = {
        "0": true,
        "1": false,
        "2": false
      };
      return specificMatch[currentCount] || (currentCount > "2");
    };

    return checkCondition(iterationCountStr) ? identifierValue : undefined;
  };

  const finalOutput = determineOutput(firstToken, valueIdentifierString);

  if (finalOutput !== undefined) {
    console.log('%s', finalOutput);
  }
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
