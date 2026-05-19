function handleInputData(receivedContent) {
    console.log(receivedContent);
}

handleInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

const INITIAL_CALC_VALUE = 0;
const THRESHOLD_REACHED_VALUE = 10;

(() => {
    let computedResult = INITIAL_CALC_VALUE;

    const isConditionSatisfied = (X >= A);

    if (isConditionSatisfied) {
        computedResult = THRESHOLD_REACHED_VALUE;
    }

    console.log(computedResult);
})();
