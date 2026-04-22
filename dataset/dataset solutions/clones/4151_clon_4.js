const sourceReader = () => {
    const inputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const primaryLine = inputContent.split('\n')[0];
    const numericalStrings = primaryLine.match(/\d+/g);
    return numericalStrings;
};

const computationEngine = (entries) => {
    const initialFigure = Number(entries[0]);
    const secondaryFigure = Number(entries[1]);

    const aggregateTotal = initialFigure + secondaryFigure;

    // Equivalent to Math.ceil(X / 2) for positive integers
    const adjustedResult = Math.floor((aggregateTotal + 1) / 2);
    return adjustedResult;
};

const applicationEntry = () => {
    const retrievedData = sourceReader();
    const finalOutcome = computationEngine(retrievedData);
    process.stdout.write(String(finalOutcome) + '\n');
};

applicationEntry();