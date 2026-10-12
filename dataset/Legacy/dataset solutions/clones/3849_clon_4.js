function processInputData(inputContent) {
    const lineSegments = inputContent.split('\n');
    const firstLineParts = lineSegments[0].split(' ');

    const valX = firstLineParts[0];
    const valY = firstLineParts[1];
    const valZ = firstLineParts[2];
    const exponentValue = lineSegments[1];

    const selectComponents = (s1, s2, s3) => {
        const conditionEvaluators = [
            () => s1 >= s2 && s1 >= s3,
            () => s2 >= s3,
            () => true
        ];

        const resultConstructors = [
            () => ({ mainComponent: s1, otherSum: s2 + s3 }),
            () => ({ mainComponent: s2, otherSum: s1 + s3 }),
            () => ({ mainComponent: s3, otherSum: s1 + s2 })
        ];

        const chosenIndex = conditionEvaluators.findIndex(evaluator => evaluator());
        return resultConstructors[chosenIndex]();
    };

    const { mainComponent, otherSum } = selectComponents(valX, valY, valZ);

    const finalCalculation = mainComponent * Math.pow(2, exponentValue) + otherSum;
    console.log(finalCalculation);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
