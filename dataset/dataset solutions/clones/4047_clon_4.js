const fileSystemAccessor = require('node:fs');
const currentProcess = require('node:process');

class OperationProcessor {
    constructor() {
        this.inputContent = '';
        this.extractedNumbers = [];
    }

    static positiveModulo(dividend, divisor) {
        if (divisor === 0) {
            return 0;
        }
        const absoluteDivisor = Math.abs(divisor);
        return (dividend % absoluteDivisor + absoluteDivisor) % absoluteDivisor;
    }

    obtainSourceData(dataSourcePath) {
        try {
            this.inputContent = fileSystemAccessor.readFileSync(dataSourcePath, { encoding: 'utf8' });
        } catch (dataAcquisitionProblem) {
            currentProcess.stderr.write(`Problem obtaining source data: ${dataAcquisitionProblem.message}\n`);
            this.inputContent = '';
        }
    }

    parseNumericInputs(textData) {
        const textLines = textData.split('\n');
        const collectedNumerals = [];
        for (let lineIndex = 0; lineIndex < textLines.length && collectedNumerals.length < 3; lineIndex++) {
            const currentLineTrimmed = textLines[lineIndex].trim();
            if (currentLineTrimmed !== '') {
                const numeralMatch = currentLineTrimmed.match(/^-?\d+/);
                if (numeralMatch) {
                    collectedNumerals.push(Number(numeralMatch[0]));
                }
            }
        }
        this.extractedNumbers = collectedNumerals;
    }

    executeArithmeticOperation() {
        if (this.extractedNumbers.length < 3) {
            return "Calculation error: Insufficient numeric data.\n";
        }
        const valueAlpha = this.extractedNumbers[0];
        const valueBeta = this.extractedNumbers[1];
        const valueGamma = this.extractedNumbers[2];

        const differenceResult = valueAlpha - valueBeta;
        const finalComputedValue = OperationProcessor.positiveModulo(differenceResult, valueGamma);
        return `${finalComputedValue}\n`;
    }

    outputFinalResult(resultString) {
        currentProcess.stdout.write(resultString);
    }
}

(function beginApplicationExecution() {
    const calculationEngine = new OperationProcessor();
    calculationEngine.obtainSourceData('/dev/stdin');
    calculationEngine.parseNumericInputs(calculationEngine.inputContent);
    const operationOutput = calculationEngine.executeArithmeticOperation();
    calculationEngine.outputFinalResult(operationOutput);
})();