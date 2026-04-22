const NumeralTools = {};
NumeralTools.formatDecimalString = function(valueToProcess, _unusedA, _unusedB, decimalCount) {
    let powerOfTenFactor = 1;
    for (let currentPower = 0; currentPower < decimalCount; currentPower++) {
        powerOfTenFactor *= 10;
    }
    let numericalRepresentation = String(Math.round(valueToProcess * powerOfTenFactor));

    if (numericalRepresentation === '0') {
        return '0.' + '0'.repeat(decimalCount);
    }

    const decimalPointIndex = numericalRepresentation.length - decimalCount;

    if (decimalPointIndex === 0) {
        return "0." + numericalRepresentation.substring(0, decimalCount);
    }
    return numericalRepresentation.substring(0, decimalPointIndex) + "." + numericalRepresentation.substring(decimalPointIndex, decimalCount);
};

const Arithmetics = {};

Arithmetics.determineCommonDivisor = function(firstOperand, secondOperand) {
    while (secondOperand !== 0) {
        let temporaryValue = secondOperand;
        secondOperand = firstOperand % secondOperand;
        firstOperand = temporaryValue;
    }
    return firstOperand;
};

Arithmetics.computeLeastCommonMultiple = function(firstOperand, secondOperand) {
    if (firstOperand === 0 || secondOperand === 0) return 0;
    const commonDivisor = this.determineCommonDivisor(firstOperand, secondOperand);
    return (firstOperand / commonDivisor) * secondOperand;
};

Arithmetics.computeSquaredValue = function(inputNumber) {
    return inputNumber ** 2;
};

class SystemHandler {
    constructor() {
        this.displayOutput = (...messages) => console.log(...messages);
        this.dataStream = process.stdin;
        this.dataStream.setEncoding('utf8');
        this.incomingNumericItems = [];

        this.dataStream.on('data', (dataChunk) => {
            const potentialNumbers = dataChunk.match(/[-]?\d+/g);
            if (potentialNumbers) {
                this.incomingNumericItems.push(...potentialNumbers);
            }
        });

        this.dataStream.on('end', () => {
            this.startProcessing();
        });
    }

    retrieveNextNumericItem() {
        if (this.incomingNumericItems.length > 0) {
            return parseInt(this.incomingNumericItems.shift(), 10);
        }
        return NaN;
    }

    areNoMoreItems() {
        return this.incomingNumericItems.length === 0;
    }

    startProcessing() {
        this.executeCalculations();
    }

    executeCalculations() {
        while (!this.areNoMoreItems()) {
            const firstInput = this.retrieveNextNumericItem();
            const secondInput = this.retrieveNextNumericItem();

            const resultGCD = Arithmetics.determineCommonDivisor(firstInput, secondInput);
            const resultLCM = Arithmetics.computeLeastCommonMultiple(firstInput, secondInput);

            this.displayOutput(resultGCD, resultLCM);
        }
    }
}

global.NumeralTools = NumeralTools;
global.Arithmetics = Arithmetics;
global.SystemHandlerInstance = new SystemHandler();