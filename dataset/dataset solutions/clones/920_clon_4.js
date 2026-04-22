class DataManager {
    #resourcePath;

    constructor(location) {
        this.#resourcePath = location;
    }

    fetchContent() {
        const fileAccess = require('node:fs');
        return fileAccess.readFileSync(this.#resourcePath, { encoding: 'utf8', flag: 'r' });
    }

    parseNumerics(rawDataPiece) {
        const numericExpressions = rawDataPiece.match(/-?\d+/g);
        if (!numericExpressions || numericExpressions.length < 2) {
            throw new Error('Insufficient numerical data points for processing.');
        }
        const primaryValues = numericExpressions.slice(0, 2).map(val => +val);
        return { firstValue: primaryValues[0], secondValue: primaryValues[1] };
    }
}

const LogicEngine = {
    checkOddness: (integerCandidate) => (integerCandidate % 2 !== 0),

    makeDecision: (firstOperand, secondOperand) => {
        const isFirstOdd = LogicEngine.checkOddness(firstOperand);
        const isSecondOdd = LogicEngine.checkOddness(secondOperand);

        if (isFirstOdd && isSecondOdd) {
            return "No";
        } else {
            return "Yes";
        }
    }
};

const orchestrateProcess = () => {
    const dataHandler = new DataManager('/dev/stdin');
    const rawDataStream = dataHandler.fetchContent();
    const extractedDataPoints = dataHandler.parseNumerics(rawDataStream);

    const finalVerdict = LogicEngine.makeDecision(extractedDataPoints.firstValue, extractedDataPoints.secondValue);
    console.log(finalVerdict);
};

orchestrateProcess();