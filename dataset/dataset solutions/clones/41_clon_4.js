const decimalFormatter = (numValue, precisionDigits) => {
    const scaleFactor = Math.pow(10, precisionDigits);
    const roundedIntegral = String(Math.round(numValue * scaleFactor));

    if (roundedIntegral === '0') {
        return '0.' + '0'.repeat(precisionDigits);
    }

    const integralPartLength = roundedIntegral.length - precisionDigits;
    let formattedResult;

    if (integralPartLength <= 0) {
        formattedResult = '0.' + '0'.repeat(-integralPartLength) + roundedIntegral;
    } else {
        formattedResult = roundedIntegral.substring(0, integralPartLength) + '.' + roundedIntegral.substring(integralPartLength);
    }
    return formattedResult;
};

const calculateGreatestCommonDivisor = (firstOperand, secondOperand) => {
    while (secondOperand !== 0) {
        let temporary = secondOperand;
        secondOperand = firstOperand % secondOperand;
        firstOperand = temporary;
    }
    return firstOperand;
};

const calculateLeastCommonMultiple = (firstOperand, secondOperand) => {
    if (firstOperand === 0 || secondOperand === 0) return 0;
    return Math.abs(firstOperand * secondOperand) / calculateGreatestCommonDivisor(firstOperand, secondOperand);
};

const squareNumber = (val) => val * val;

class GeometricProcessor {
    constructor() {
        this.dataBuffer = [];
        this.dataPointer = 0;
        this.dataPattern = /[-]?\d+(\.\d+)?/g;
        this.resultDisplay = console.log;
    }

    acquireNextIntegral() {
        if (this.dataPointer >= this.dataBuffer.length) {
            throw new Error("Input data exhausted for integral value.");
        }
        return parseInt(this.dataBuffer[this.dataPointer++], 10);
    }

    acquireNextFloatingPoint() {
        if (this.dataPointer >= this.dataBuffer.length) {
            throw new Error("Input data exhausted for floating point value.");
        }
        return parseFloat(this.dataBuffer[this.dataPointer++]);
    }

    checkRemainingData() {
        return this.dataPointer < this.dataBuffer.length;
    }

    async initiateProcessing() {
        const lineReader = require('readline');
        const inputInterface = lineReader.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        for await (const currentLine of inputInterface) {
            const discoveredMatches = currentLine.match(this.dataPattern);
            if (discoveredMatches) {
                this.dataBuffer.push(...discoveredMatches.filter(segment => segment.length > 0));
            }
        }
        this.executeMainSequence();
    }

    executeMainSequence() {
        let cyclesRemaining = this.acquireNextIntegral();

        for (let cycleIndex = 0; cycleIndex < cyclesRemaining; cycleIndex++) {
            this.handleSingleCircuit();
        }

        if (this.checkRemainingData()) {
             Promise.resolve().then(() => this.executeMainSequence());
        }
    }

    handleSingleCircuit() {
        const p1X = this.acquireNextFloatingPoint();
        const p1Y = this.acquireNextFloatingPoint();
        const p2X = this.acquireNextFloatingPoint();
        const p2Y = this.acquireNextFloatingPoint();
        const p3X = this.acquireNextFloatingPoint();
        const p3Y = this.acquireNextFloatingPoint();

        const paramAlpha = p1X - p2X;
        const paramBeta = p1Y - p2Y;
        const paramGamma = -1 * ( squareNumber(p1X) - squareNumber(p2X) + squareNumber(p1Y) - squareNumber(p2Y) );
        const paramDelta = p1X - p3X;
        const paramEpsilon = p1Y - p3Y;
        const paramZeta = -1 * ( squareNumber(p1X) - squareNumber(p3X) + squareNumber(p1Y) - squareNumber(p3Y) );

        const denominatorValue = paramEpsilon * paramAlpha - paramBeta * paramDelta;

        const primaryCoeff = (paramGamma * paramEpsilon - paramBeta * paramZeta) / denominatorValue;
        const secondaryCoeff = (paramAlpha * paramZeta - paramDelta * paramGamma) / denominatorValue;

        const constantTerm = -1 * ( squareNumber(p1X) + squareNumber(p1Y) + primaryCoeff * p1X + secondaryCoeff * p1Y );
        
        this.resultDisplay(
            decimalFormatter(primaryCoeff / -2.0, 3),
            decimalFormatter(secondaryCoeff / -2.0, 3),
            decimalFormatter(Math.sqrt(squareNumber(primaryCoeff) + squareNumber(secondaryCoeff) + 4 * constantTerm) / 2.0, 3)
        );
    }
}

const processorUnit = new GeometricProcessor();
processorUnit.initiateProcessing();