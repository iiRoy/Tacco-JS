"use strict";

const evaluateCondition = (paramInput) => {
    const numericalValue = parseInt(paramInput.trim(), 10);

    return (numericalValue < 100)
        ? 0 
        : ((numericalValue % 100 === 0)
            ? 1 
            : ((numericalValue >= (Math.ceil((numericalValue % 100) / 5) * 100 + (numericalValue % 100)))
                ? 1 
                : 0 
            )
        );
};

const executeLogic = (dataFeed) => {
    console.log(evaluateCondition(dataFeed));
};

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));