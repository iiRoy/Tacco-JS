const OperationVault = {
    obtainSource: function() {
        const fileSys = require('fs');
        const contentBlock = fileSys.readFileSync('/dev/stdin', 'utf8');
        return contentBlock.trim().split('\n');
    },

    numericalConversion: function(txt) {
        return Number(txt);
    },

    absoluteSpan: function(valOne, valTwo) {
        const difference = valOne - valTwo;
        return (difference < 0) ? -difference : difference;
    },

    integerQuotient: function(dividend, divisor) {
        return (dividend / divisor) | 0;
    }
};

function computeOptimalValue() {
    const dataSegments = OperationVault.obtainSource();

    const rangeLimit = OperationVault.numericalConversion(dataSegments[0]);

    const firstCoordStrings = dataSegments[1].split(' ');
    const firstX = OperationVault.numericalConversion(firstCoordStrings[0]);
    const firstY = OperationVault.numericalConversion(firstCoordStrings[1]);

    const secondCoordStrings = dataSegments[2].split(' ');
    const secondX = OperationVault.numericalConversion(secondCoordStrings[0]);
    const secondY = OperationVault.numericalConversion(secondCoordStrings[1]);

    let bestOutcome = Infinity;

    const iterativeSearch = (currentIterand, currentMinimum) => {
        if (currentIterand > rangeLimit) {
            return currentMinimum;
        }

        const remDiffOne = OperationVault.absoluteSpan(firstX % currentIterand, firstY % currentIterand);
        const quoDiffOne = OperationVault.absoluteSpan(
            OperationVault.integerQuotient(firstX, currentIterand),
            OperationVault.integerQuotient(firstY, currentIterand)
        );
        const combinedOne = remDiffOne + quoDiffOne;

        const remDiffTwo = OperationVault.absoluteSpan(secondX % currentIterand, secondY % currentIterand);
        const quoDiffTwo = OperationVault.absoluteSpan(
            OperationVault.integerQuotient(secondX, currentIterand),
            OperationVault.integerQuotient(secondY, currentIterand)
        );
        const combinedTwo = remDiffTwo + quoDiffTwo;

        const totalCombined = combinedOne + combinedTwo;
        const nextMinimum = (totalCombined < currentMinimum) ? totalCombined : currentMinimum;

        return iterativeSearch(currentIterand + 1, nextMinimum);
    };

    bestOutcome = iterativeSearch(1, bestOutcome);

    process.stdout.write(bestOutcome.toString() + '\n');
}

computeOptimalValue();