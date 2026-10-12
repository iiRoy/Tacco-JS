function calculateDepletionRounds(initialResource, depletionRate) {
    if (initialResource <= 0) return 0;
    if (depletionRate <= 0) return Infinity;
    return Math.ceil(initialResource / depletionRate);
}

function calculateConditionalActions(initialResource, depletionRate) {
    if (initialResource <= 0) return 0;
    if (depletionRate <= 0) return Infinity;
    return Math.floor((initialResource - 1) / depletionRate);
}

function Main(input) {
    const parsedValues = input.split(" ");

    const resourceA = parseInt(parsedValues[0], 10);
    const rateB = parseInt(parsedValues[1], 10);
    const resourceC = parseInt(parsedValues[2], 10);
    const rateD = parseInt(parsedValues[3], 10);

    const cAllowsActions = calculateConditionalActions(resourceC, rateB);

    const aCanEndure = calculateDepletionRounds(resourceA, rateD);

    const totalActionsOnA = Math.min(cAllowsActions, aCanEndure);

    const remainingA = resourceA - totalActionsOnA * rateD;

    if (remainingA > 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
