const parseNumericValue = (inputString) => {
    return parseInt(inputString, 10);
};

function processInput(rawData) {
    const splitData = rawData.split(" ");

    const storageCapacity = parseNumericValue(splitData[0]);
    const weightLoad = parseNumericValue(splitData[1]);

    const difference = storageCapacity - weightLoad;

    let resultStatus;
    if (difference <= 0) {
        resultStatus = 'unsafe';
    } else {
        resultStatus = 'safe';
    }

    console.log(resultStatus);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
