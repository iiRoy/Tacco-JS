const solveProblem = (inputString) => {
    const lines = inputString.split('\n').filter(Boolean);
    const [headerLine, ...dataLines] = lines;
    const [totalPoints, totalCapacity] = headerLine.split(' ').map(Number);

    const locationsAndValues = dataLines.map(line => {
        const [position, value] = line.split(' ').map(Number);
        return { position, value };
    });

    let optimalBenefit = 0;

    const forwardPassCalculations = locationsAndValues.reduce((acc, currentPoint, index) => {
        const previousValueAccumulation = acc.length > 0 ? acc[acc.length - 1].valueAccumulation : 0;
        
        const currentValueAccumulation = previousValueAccumulation + currentPoint.value;
        const benefitStoppingAtCurrent = currentValueAccumulation - currentPoint.position;
        const benefitRoundtripToCurrent = currentValueAccumulation - (2 * currentPoint.position);

        acc.push({
            valueAccumulation: currentValueAccumulation,
            benefitStopping: benefitStoppingAtCurrent,
            benefitRoundtrip: benefitRoundtripToCurrent
        });
        return acc;
    }, []);

    const backwardPassCalculations = locationsAndValues.reduceRight((acc, currentPoint, index) => {
        const previousValueAccumulation = acc.length > 0 ? acc[0].valueAccumulation : 0;
        
        const currentValueAccumulation = previousValueAccumulation + currentPoint.value;
        const distanceToCapacity = totalCapacity - currentPoint.position;
        const benefitStoppingAtCurrent = currentValueAccumulation - distanceToCapacity;
        const benefitRoundtripToCurrent = currentValueAccumulation - (2 * distanceToCapacity);

        acc.unshift({
            valueAccumulation: currentValueAccumulation,
            benefitStopping: benefitStoppingAtCurrent,
            benefitRoundtrip: benefitRoundtripToCurrent
        });
        return acc;
    }, []);

    optimalBenefit = Math.max(
        optimalBenefit,
        ...forwardPassCalculations.map(s => s.benefitStopping),
        ...backwardPassCalculations.map(s => s.benefitStopping)
    );

    const maxPrefixBenefitStopping = forwardPassCalculations.reduce((acc, state, index) => {
        const previousMax = index > 0 ? acc[index - 1] : -Infinity;
        acc.push(Math.max(previousMax, state.benefitStopping));
        return acc;
    }, []);

    const maxSuffixBenefitStopping = locationsAndValues.reduceRight((acc, _, index) => {
        const previousMax = acc.length > 0 ? acc[0] : -Infinity;
        acc.unshift(Math.max(previousMax, backwardPassCalculations[index].benefitStopping));
        return acc;
    }, []);

    for (let splitPoint = 0; splitPoint < totalPoints; splitPoint++) {
        if (splitPoint < totalPoints - 1) {
            const combinedValue = forwardPassCalculations[splitPoint].benefitRoundtrip + maxSuffixBenefitStopping[splitPoint + 1];
            optimalBenefit = Math.max(optimalBenefit, combinedValue);
        }
    }

    for (let splitPoint = totalPoints - 1; splitPoint >= 0; splitPoint--) {
        if (splitPoint > 0) {
            const combinedValue = backwardPassCalculations[splitPoint].benefitRoundtrip + maxPrefixBenefitStopping[splitPoint - 1];
            optimalBenefit = Math.max(optimalBenefit, combinedValue);
        }
    }

    return optimalBenefit;
};

const executeSolution = (inputData) => {
    console.log(solveProblem(inputData));
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));