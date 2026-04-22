const sourceAcquisitionModule = globalThis.require('node:fs');
const contentRetriever = sourceAcquisitionModule.readFileSync;

const processNumericalSequence = (sequenceOfNumbers) => {
    const [alpha, beta, gamma, delta, epsilon] = sequenceOfNumbers;

    const conditionResult = (delta + gamma > beta);

    const resultMapping = new Map();
    resultMapping.set(true, 'No');
    resultMapping.set(false, 'Yes');

    return resultMapping.get(conditionResult);
};

const executeFlow = (inputPath) => {
    const rawInputContent = contentRetriever(inputPath, 'utf8');
    const firstLineContent = rawInputContent.split('\n')[0];
    const numericStrings = firstLineContent.split(' ');
    
    const parsedNumerics = numericStrings.reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const finalResult = processNumericalSequence(parsedNumerics);
    globalThis.process.stdout.write(finalResult + '\n');
};

executeFlow('/dev/stdin');