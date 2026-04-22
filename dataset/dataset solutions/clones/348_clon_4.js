const fsModule = require("fs");
const logOutput = console.log;

const tokenTypes = {
    NUMBER: 'NUM',
    OPERATOR: 'OP',
    L_PAREN: 'LPAREN',
    R_PAREN: 'RPAREN'
};

const operatorDetails = {
    '+': { precedence: 1, associativity: 'L' },
    '-': { precedence: 1, associativity: 'L' },
    '*': { precedence: 2, associativity: 'L' },
    '/': { precedence: 2, associativity: 'L' }
};

function readAllEntries() {
    const rawContent = fsModule.readFileSync("/dev/stdin", "utf8");
    const contentLines = rawContent.replace(/\r/g, '').split("\n").filter(line => line.trim() !== "");

    const entryCount = parseInt(contentLines[0], 10);
    const inputSeries = contentLines.slice(1);

    return {
        entryCount: entryCount,
        inputSeries: inputSeries
    };
}

function generateTokens(formulaText) {
    const generatedTokens = [];
    let currentPosition = 0;
    const formulaLength = formulaText.length;

    while (currentPosition < formulaLength) {
        let character = formulaText[currentPosition];

        if (character === ' ') {
            currentPosition++;
            continue;
        }

        if (character === '(') {
            generatedTokens.push({ type: tokenTypes.L_PAREN, value: character });
            currentPosition++;
        } else if (character === ')') {
            generatedTokens.push({ type: tokenTypes.R_PAREN, value: character });
            currentPosition++;
        } else if (operatorDetails[character]) {
            generatedTokens.push({ type: tokenTypes.OPERATOR, value: character });
            currentPosition++;
        } else if (/\d/.test(character)) {
            let numericString = '';
            while (currentPosition < formulaLength && /\d/.test(formulaText[currentPosition])) {
                numericString += formulaText[currentPosition];
                currentPosition++;
            }
            generatedTokens.push({ type: tokenTypes.NUMBER, value: parseInt(numericString, 10) });
        } else {
            currentPosition++;
        }
    }
    return generatedTokens;
}

function convertInfixToRPN(tokenStream) {
    const outputPile = [];
    const operatorPile = [];

    for (const currentItem of tokenStream) {
        if (currentItem.type === tokenTypes.NUMBER) {
            outputPile.push(currentItem);
        } else if (currentItem.type === tokenTypes.OPERATOR) {
            const currentOpInfo = operatorDetails[currentItem.value];
            let topOpItem = operatorPile[operatorPile.length - 1];

            while (
                operatorPile.length > 0 &&
                topOpItem.type === tokenTypes.OPERATOR &&
                (
                    operatorDetails[topOpItem.value].precedence > currentOpInfo.precedence ||
                    (operatorDetails[topOpItem.value].precedence === currentOpInfo.precedence && currentOpInfo.associativity === 'L')
                )
            ) {
                outputPile.push(operatorPile.pop());
                topOpItem = operatorPile[operatorPile.length - 1];
            }
            operatorPile.push(currentItem);
        } else if (currentItem.type === tokenTypes.L_PAREN) {
            operatorPile.push(currentItem);
        } else if (currentItem.type === tokenTypes.R_PAREN) {
            while (operatorPile.length > 0 && operatorPile[operatorPile.length - 1].type !== tokenTypes.L_PAREN) {
                outputPile.push(operatorPile.pop());
            }
            operatorPile.pop();
        }
    }

    while (operatorPile.length > 0) {
        outputPile.push(operatorPile.pop());
    }

    return outputPile;
}

function computeRPN(rpnTokens) {
    const operandPile = [];

    for (const element of rpnTokens) {
        if (element.type === tokenTypes.NUMBER) {
            operandPile.push(element.value);
        } else if (element.type === tokenTypes.OPERATOR) {
            const val2 = operandPile.pop();
            const val1 = operandPile.pop();

            let outcome;
            switch (element.value) {
                case '+':
                    outcome = val1 + val2;
                    break;
                case '-':
                    outcome = val1 - val2;
                    break;
                case '*':
                    outcome = val1 * val2;
                    break;
                case '/':
                    outcome = Math.trunc(val1 / val2);
                    break;
            }
            operandPile.push(outcome);
        }
    }
    return operandPile.pop();
}

const acquiredData = readAllEntries();

for (let i = 0; i < acquiredData.entryCount; i++) {
    const currentFormulaString = acquiredData.inputSeries[i];
    const processedFormulaString = currentFormulaString.slice(0, -1); // Remove last character, typically a semicolon

    const expressionTokens = generateTokens(processedFormulaString);
    const rpnForm = convertInfixToRPN(expressionTokens);
    const finalOutcome = computeRPN(rpnForm);
    logOutput(finalOutcome);
}