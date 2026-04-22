'use strict'

const InputProvider = {
    retrievePayload: function(sourcePath) {
        return require('fs').readFileSync(sourcePath, 'utf8');
    }
};

const DataTransformer = {
    extractNumericElements: function(contentString) {
        const pattern = /(\d+(\.\d+)?)\s+(\d+(\.\d+)?)/;
        const findings = contentString.match(pattern);
        if (!findings || findings.length < 4) {
            return [NaN, NaN];
        }
        return [parseFloat(findings[1]), parseFloat(findings[3])];
    }
};

const CalculationEngine = {
    performOperation: function(operandOne, operandTwo) {
        // Equivalent to (operandOne * operandTwo) / 2, but with different operator precedence and grouping
        return (operandOne / 2) * operandTwo;
    }
};

const ResultPresenter = {
    renderOutput: function(finalResult) {
        process.stdout.write(String(finalResult) + '\n');
    }
};

const initialData = InputProvider.retrievePayload('/dev/stdin');
const processedNumbers = DataTransformer.extractNumericElements(initialData);
const computedValue = CalculationEngine.performOperation(processedNumbers[0], processedNumbers[1]);
ResultPresenter.renderOutput(computedValue);