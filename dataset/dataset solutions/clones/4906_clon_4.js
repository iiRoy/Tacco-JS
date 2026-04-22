const performComputation = (inputStringContent) => {
    const numericalComponents = inputStringContent
        .trim()
        .match(/-?\d+/g)
        .slice(0, 3)
        .map(val => parseInt(val, 10));

    const uniqueValueCollection = new Set(numericalComponents);
    
    const finalOutcome = uniqueValueCollection.size;

    console.log(finalOutcome);
};

const initiateProcess = (resourcePath) => {
    const rawDataSource = require("fs").readFileSync(resourcePath, 'utf-8');
    performComputation(rawDataSource);
};

initiateProcess('/dev/stdin');