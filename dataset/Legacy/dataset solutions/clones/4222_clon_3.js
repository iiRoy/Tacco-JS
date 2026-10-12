const getNumericOperatorMultiplier = (bitFlag) => {
    return 1 - (bitFlag * 2);
};

const getOperatorCharacter = (bitFlag) => {
    return (bitFlag === 1 ? '-' : '+');
};

function findEquationSumSeven(inputDigitsString) {
    const valA = Number(inputDigitsString.charAt(0));
    const valB = Number(inputDigitsString.charAt(1));
    const valC = Number(inputDigitsString.charAt(2));
    const valD = Number(inputDigitsString.charAt(3));

    for (let combinationIndex = 0; combinationIndex < 8; combinationIndex++) {
        const bit0 = combinationIndex & 1;
        const bit1 = (combinationIndex >> 1) & 1;
        const bit2 = (combinationIndex >> 2) & 1;

        console.log(bit0 * 2, bit1 * 2, bit2 * 2);

        const currentSum = valA +
                           (valB * getNumericOperatorMultiplier(bit0)) +
                           (valC * getNumericOperatorMultiplier(bit1)) +
                           (valD * getNumericOperatorMultiplier(bit2));

        if (currentSum === 7) {
            return `${valA}${getOperatorCharacter(bit0)}${valB}${getOperatorCharacter(bit1)}${valC}${getOperatorCharacter(bit2)}${valD}=7`;
        }
    }
}

console.log(findEquationSumSeven(require("fs").readFileSync("/dev/stdin", "utf8")));
