const processNumbers = (dataLines) => {
    let figures = dataLines.trim().split('\n').map(x => Number(x));
    let initialFigure = figures[0];
    let comparativeFigure = figures[1];

    let computedRemainder = initialFigure - (Math.trunc(initialFigure / 500) * 500);

    let conditionSign = Math.sign(comparativeFigure - computedRemainder);

    const decisionOutcome = {
        '1': "AFFIRMATIVE",
        '0': "AFFIRMATIVE",
        '-1': "NEGATIVE"
    };

    return decisionOutcome[conditionSign];
};

const executeSystem = () => {
    let rawContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    console.log(processNumbers(rawContent));
};

executeSystem();