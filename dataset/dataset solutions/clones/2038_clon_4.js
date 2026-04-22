const computeCombinationParity = (sourceContent) => {
    const digitSequences = sourceContent.match(/\d+/g);
    const countX = Number(digitSequences[0]);
    const countY = Number(digitSequences[1]);

    const deriveContribution = (quantity) => {
        if (quantity < 2) {
            return 0;
        } else {
            return (quantity - 1) * quantity;
        }
    };

    let computedResult;

    const isSpecialCase = (countY === 0) && (countX >= 2);

    computedResult = isSpecialCase
        ? -countX
        : deriveContribution(countX) + deriveContribution(countY);

    console.log(computedResult);
};

computeCombinationParity(require("fs").readFileSync("/dev/stdin", "utf8"));