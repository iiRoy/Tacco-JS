const processInputData = (rawInputContent) => {
    const extractedValues = rawInputContent.match(/(\d+)\s+(\d+)/);
    const firstNumericValue = Number(extractedValues[1]);
    const secondNumericValue = Number(extractedValues[2]);

    const decisionMap = ["unsafe", "safe"];
    const outcomeSelector = Number(secondNumericValue > firstNumericValue);

    console.log(decisionMap[outcomeSelector]);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
