const dataOrigin = require("node:fs").readFileSync("/dev/stdin", "utf8");

((textBlock) => {
    const rawSegments = textBlock.split('\n');
    const numericalArray = rawSegments[1].split(' ').map(Number);

    if (numericalArray.length <= 1) {
        process.stdout.write(String(1) + '\n');
        return;
    }

    const valueChanges = numericalArray.slice(1).map((element, position) => {
        return element - numericalArray[position];
    });

    const initialCondition = { curveCount: 0, presentPath: 0 };

    const pathEvaluator = (accumulator, deltaValue) => {
        if (deltaValue > 0) {
            if (accumulator.presentPath === -1) {
                return { curveCount: accumulator.curveCount + 1, presentPath: 1 };
            } else {
                return { ...accumulator, presentPath: 1 };
            }
        } else if (deltaValue < 0) {
            if (accumulator.presentPath === 1) {
                return { curveCount: accumulator.curveCount + 1, presentPath: -1 };
            } else {
                return { ...accumulator, presentPath: -1 };
            }
        }
        return accumulator;
    };

    const finalState = valueChanges.reduce(pathEvaluator, initialCondition);

    process.stdout.write(String(finalState.curveCount + 1) + '\n');

})(dataOrigin);