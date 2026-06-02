const processInput = (rawData) => {
    const parsedData = rawData.split('\n').map(Number);
    const iterationCount = parsedData[0];
    const thresholdValue = parsedData[1];

    const finalResult = Array.from({ length: iterationCount }).reduce((currentAccumulator) => {
        return currentAccumulator >= thresholdValue ? currentAccumulator + thresholdValue : currentAccumulator * 2;
    }, 1);

    console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
