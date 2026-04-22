const processDocument = (streamContent) => {
    const contentLines = streamContent.split('\n');

    // Mimic JavaScript's Abstract Relational Comparison for the '<' operator.
    // This handles the subtle type coercion rules for strings, numbers, and undefined/null.
    const customRelationalLessThan = (operandA, operandB) => {
        // If both operands are strings, perform lexicographical comparison.
        if (typeof operandA === 'string' && typeof operandB === 'string') {
            return operandA < operandB;
        }

        // Otherwise, convert both operands to numbers and compare.
        // Number('') is 0. Number(undefined) is NaN.
        const numericA = Number(operandA);
        const numericB = Number(operandB);

        // If either conversion results in NaN, the comparison is false (e.g., NaN < X is false).
        if (isNaN(numericA) || isNaN(numericB)) {
            return false;
        }

        // Perform numerical comparison.
        return numericA < numericB;
    };

    // Store the relevant input values in an object with descriptive keys.
    // Keep them as strings initially to allow customRelationalLessThan to handle type-specific comparisons.
    const comparisonSet = {
        primaryComponent: contentLines[0],
        secondaryComponent: contentLines[4],
        referenceComponent: contentLines[5]
    };

    // A higher-order function to create an evaluator based on a specific criteria function.
    const makeEvaluator = (criteriaFunction) => {
        return (components) => {
            return criteriaFunction(components.primaryComponent, components.secondaryComponent, components.referenceComponent);
        };
    };

    // Define the core comparison logic using the custom relational operator.
    const criteriaLogic = (val1, val2, refVal) => {
        return customRelationalLessThan(val1, refVal) && customRelationalLessThan(val2, refVal);
    };

    // Instantiate the evaluator with the defined criteria.
    const runEvaluation = makeEvaluator(criteriaLogic);

    // Execute the evaluation and determine the final output message using a ternary operator.
    const finalMessage = runEvaluation(comparisonSet) ? 'Yay!' : ':(';

    console.log(finalMessage);
};

processDocument(require("fs").readFileSync("/dev/stdin","utf8"));