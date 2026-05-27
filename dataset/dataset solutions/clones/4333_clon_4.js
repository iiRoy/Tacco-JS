var main = function(entryData) {
    var numericInputs = entryData.split(' ').map(val => parseInt(val));
    var upperI = numericInputs[0];
    var upperJ = numericInputs[1];
    var targetSum = numericInputs[2];

    let outcomeIndicator = false;

    const iRange = Array.from({ length: upperI + 1 }, (_, index) => index);

    outcomeIndicator = iRange.some(currentIValue => {
        const jRange = Array.from({ length: upperJ + 1 }, (_, index) => index);
        return jRange.some(currentJValue => {
            const computedResult = currentJValue * (upperI - currentIValue) + currentIValue * (upperJ - currentJValue);
            return computedResult === targetSum;
        });
    });

    if (outcomeIndicator) {
        console.log('Yes');
    } else {
        console.log('Ans');
    }
    return 0;
};

main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
