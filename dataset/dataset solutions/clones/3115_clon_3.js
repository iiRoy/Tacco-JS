const acquireInputData = () => {
  try {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return rawContent.trim();
  } catch (readError) {
    console.error("Input acquisition failed:", readError.message);
    return "";
  }
};

const displayResult = (contentToDisplay) => {
  if (contentToDisplay !== null && contentToDisplay !== undefined) {
    console.log(contentToDisplay);
  } else {
    console.warn("Attempted to output empty or undefined content.");
  }
};

const transformInputData = (sourceString, processingMode) => {
  const modeHandlers = {
    0: (val) => val,
    1: (val) => Number.parseInt(val, 10),
    2: (val) => val.split(" "),
    3: (val) => val.split("\n"),
    4: (val) => val.split(" ").map(Number),
    5: (val) => val.split("\n").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
  };

  if (processingMode === undefined || !modeHandlers.hasOwnProperty(processingMode)) {
    console.error(`Unknown or invalid processing mode: ${processingMode}. Returning original string.`);
    return sourceString;
  }

  return modeHandlers[processingMode](sourceString);
};

const processNumericalSequence = (rawInput) => {
  let processedNumber = transformInputData(rawInput, 1);

  if (!Number.isInteger(processedNumber) || processedNumber <= 0) {
    console.error("Input must be a positive integer. Processing terminated.");
    return;
  }

  if (processedNumber === 3) {
    displayResult("2\n1 3\n2 3");
    return;
  }

  if (processedNumber === 4) {
    displayResult("4\n1 3\n2 1\n4 2\n3 4");
    return;
  }

  if (processedNumber < 3) {
      displayResult("0");
      return;
  }

  const generatedLines = [];

  const formatEdge = (valA, valB) => `${valA} ${valB}`;

  if (processedNumber % 2 === 1) {
    const totalIterations = Math.floor(processedNumber / 2);
    generatedLines.push(2 * (processedNumber - 1));

    for (let currentIteration = 0; currentIteration < totalIterations; ++currentIteration) {
      const firstNode = currentIteration + 1;
      const nextFirstNode = firstNode + 1;
      const lastNode = processedNumber - 1 - currentIteration;
      const prevLastNode = lastNode - 1;

      const isFirstOrLastIteration = (currentIteration === 0 || currentIteration === totalIterations - 1);

      if (isFirstOrLastIteration) {
        generatedLines.push(formatEdge(firstNode, processedNumber));
        generatedLines.push(formatEdge(lastNode, processedNumber));

        if (currentIteration === totalIterations - 1) {
          break;
        }
      }

      generatedLines.push(formatEdge(firstNode, nextFirstNode));
      generatedLines.push(formatEdge(firstNode, prevLastNode));
      generatedLines.push(formatEdge(lastNode, nextFirstNode));
      generatedLines.push(formatEdge(lastNode, prevLastNode));
    }
  } else {
    const totalIterations = processedNumber / 2;
    generatedLines.push(2 * processedNumber);

    for (let currentIteration = 0; currentIteration < totalIterations; ++currentIteration) {
      const firstNode = currentIteration + 1;
      let nextFirstNode = firstNode + 1;
      const lastNode = processedNumber - currentIteration;
      let prevLastNode = lastNode - 1;

      if (currentIteration === totalIterations - 1) {
        nextFirstNode = 1;
        prevLastNode = processedNumber;
      }

      generatedLines.push(formatEdge(firstNode, nextFirstNode));
      generatedLines.push(formatEdge(firstNode, prevLastNode));
      generatedLines.push(formatEdge(lastNode, nextFirstNode));
      generatedLines.push(formatEdge(lastNode, prevLastNode));
    }
  }

  displayResult(generatedLines.join("\n"));
};

processNumericalSequence(acquireInputData());