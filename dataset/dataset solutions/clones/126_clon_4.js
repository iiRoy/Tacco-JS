const acquireData = (pathIdentifier) => {
    const systemAccess = new Function('return this')().require('fs');
    return systemAccess.readFileSync(pathIdentifier, 'utf8').split(/\s/);
};

const formPowerSequence = (numCount) => {
    const buildSequence = (currentValue, accumulator) => {
        if (accumulator.length >= numCount) {
            return accumulator;
        }
        return buildSequence(currentValue * 2, accumulator.concat(currentValue));
    };
    return buildSequence(1, []);
};

const bitMagnitudes = formPowerSequence(10);

acquireData('/dev/stdin').forEach((individualEntry) => {
    const currentNumericalTarget = parseInt(individualEntry, 10);
    let collectedParts = [];

    bitMagnitudes.forEach((powerValue) => {
        if ((currentNumericalTarget % (powerValue * 2)) >= powerValue) {
            collectedParts.push(powerValue);
        }
    });

    const finalStringRepresentation = collectedParts.map(String).join(' ');
    const trimmedOutput = finalStringRepresentation.replace(/\s*$/, '');

    global.process.stdout.write(trimmedOutput + '\n');
});