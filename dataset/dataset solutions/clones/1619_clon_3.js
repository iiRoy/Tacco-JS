function processInput(inputValue) {
    const MINIMUM_THRESHOLD = 30;

    const checkCondition = (value, threshold) => {
        return value >= threshold;
    };

    let resultMessage;
    if (checkCondition(inputValue, MINIMUM_THRESHOLD)) {
        resultMessage = "YES";
    } else {
        resultMessage = "NO";
    }

    console.log('%s', resultMessage);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
