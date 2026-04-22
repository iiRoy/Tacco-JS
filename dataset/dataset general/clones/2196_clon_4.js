const defaultCalculationContext = {
    calculationSequence: ["0"],
    lastInputCategory: 'EQUALS',
    currentNumberContainsDecimal: false,
    resultIsCurrentDisplay: true,
    storedNumericValue: 0
};

let arithmeticUnitInstance;
if (typeof globalArithmeticProcessor !== 'undefined') {
    arithmeticUnitInstance = globalArithmeticProcessor;
}

class ComputationalUnit {
    #expressionParts;
    #lastInputType;
    #decimalPointActive;
    #isResultDisplayed;
    #memoryStore;

    constructor(initialContext) {
        const context = initialContext || defaultCalculationContext;
        this.#expressionParts = context.calculationSequence.map(String);
        this.#lastInputType = context.lastInputCategory;
        this.#decimalPointActive = context.currentNumberContainsDecimal;
        this.#isResultDisplayed = context.resultIsCurrentDisplay;
        this.#memoryStore = context.storedNumericValue;
    }

    retrieveDisplayValue() {
        return this.#expressionParts.join('');
    }

    processInputToken(token) {
        const isDigit = !isNaN(token) && token !== ' ';
        const isOperator = ['+', '-', '*', '/'].includes(token);
        const isDecimal = token === '.';
        const isEqual = token === '=';

        if (isDigit) {
            if (this.#isResultDisplayed || this.#lastInputType === 'CLEAR') {
                this.#expressionParts = [String(token)];
            } else {
                let lastPart = this.#expressionParts[this.#expressionParts.length - 1];
                if (this.#lastInputType === 'OPERATOR' && lastPart === '-') {
                    this.#expressionParts[this.#expressionParts.length - 1] = '-' + String(token);
                } else if (this.#lastInputType === 'NUMBER' || this.#lastInputType === 'DECIMAL_POINT' || (this.#lastInputType === 'OPERATOR' && lastPart.startsWith('-') && lastPart.length > 1)) {
                    this.#expressionParts[this.#expressionParts.length - 1] += String(token);
                } else {
                    this.#expressionParts.push(String(token));
                }
            }
            this.#lastInputType = 'NUMBER';
            this.#isResultDisplayed = false;
        } else if (isDecimal) {
            if (this.#isResultDisplayed) {
                this.#expressionParts = ["0."];
                this.#decimalPointActive = true;
            } else if (this.#decimalPointActive) {
                return;
            } else if (this.#lastInputType === 'NUMBER') {
                this.#expressionParts[this.#expressionParts.length - 1] += '.';
            } else {
                this.#expressionParts.push("0.");
            }
            this.#decimalPointActive = true;
            this.#lastInputType = 'DECIMAL_POINT';
            this.#isResultDisplayed = false;
        } else if (isOperator) {
            const currentTokenIsSign = (token === '+' || token === '-');
            
            if ((this.#lastInputType === 'OPERATOR' || this.#lastInputType === 'DECIMAL_POINT') && (!currentTokenIsSign || this.#decimalPointActive)) {
                return;
            }

            if (this.#expressionParts.length === 0) {
                if (token !== '-') { // Only prepend "0" if not starting with unary minus
                    this.#expressionParts.push("0");
                }
            } else if (this.#lastInputType === 'OPERATOR') {
                 // If the last part is a unary minus combined with a number, treat current operator as new.
                 // E.g., ["5", "+", "-2"], then press "*", should be ["5", "+", "-2", "*"]
                const lastPart = this.#expressionParts[this.#expressionParts.length - 1];
                if (lastPart.startsWith('-') && !isNaN(parseFloat(lastPart))) {
                    this.#expressionParts.push(token);
                } else {
                    this.#expressionParts.push(token); // Append operator
                }
            } else {
                this.#expressionParts.push(token);
            }
            this.#lastInputType = 'OPERATOR';
            this.#decimalPointActive = false;
            this.#isResultDisplayed = false;
        } else if (isEqual) {
            if (this.#lastInputType === 'OPERATOR' || this.#lastInputType === 'DECIMAL_POINT') {
                return;
            }
            let result = this.#evaluateExpression();
            this.#expressionParts = [String(result)];
            this.#isResultDisplayed = true;
            this.#decimalPointActive = String(result).includes('.');
            this.#lastInputType = 'EQUALS';
        }
        
        if (typeof outputPanel !== 'undefined' && outputPanel.updateText) {
            outputPanel.updateText(this.retrieveDisplayValue());
        }
    }

    resetCurrentEntry() {
        this.#expressionParts = [""];
        this.#isResultDisplayed = false;
        this.#decimalPointActive = false;
        this.#lastInputType = 'CLEAR';
        if (typeof outputPanel !== 'undefined' && outputPanel.updateText) {
            outputPanel.updateText(this.retrieveDisplayValue());
        }
    }

    resetAll() {
        this.#expressionParts = ["0"];
        this.#isResultDisplayed = true;
        this.#decimalPointActive = false;
        this.#lastInputType = 'EQUALS';
        if (typeof outputPanel !== 'undefined' && outputPanel.updateText) {
            outputPanel.updateText(this.retrieveDisplayValue());
        }
    }

    saveToMemory() {
        const currentVal = parseFloat(this.retrieveDisplayValue());
        if (!isNaN(currentVal)) {
            this.#memoryStore = currentVal;
            console.log("Memory value set to: " + this.#memoryStore);
        }
    }

    retrieveFromMemory() {
        this.processInputToken(String(this.#memoryStore));
    }

    #evaluateExpression() {
        const cleanTokens = [];
        let i = 0;
        while (i < this.#expressionParts.length) {
            const part = this.#expressionParts[i];

            if (part === '-' && (i === 0 || ['+', '-', '*', '/'].includes(this.#expressionParts[i-1]))) {
                let nextPart = this.#expressionParts[i+1];
                if (nextPart !== undefined && !isNaN(parseFloat(nextPart))) {
                    cleanTokens.push(-parseFloat(nextPart));
                    i += 2;
                    continue;
                }
            }
            
            if (['+', '-'].includes(part) && ['+', '-'].includes(cleanTokens[cleanTokens.length - 1])) {
                const prevOp = cleanTokens.pop();
                let combinedOp;
                if (prevOp === '+' && part === '+') combinedOp = '+';
                else if (prevOp === '+' && part === '-') combinedOp = '-';
                else if (prevOp === '-' && part === '+') combinedOp = '-';
                else if (prevOp === '-' && part === '-') combinedOp = '+';
                cleanTokens.push(combinedOp);
            } else if (!isNaN(parseFloat(part))) {
                cleanTokens.push(parseFloat(part));
            } else {
                cleanTokens.push(part);
            }
            i++;
        }

        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
        const outputQueue = [];
        const operatorStack = [];

        for (const token of cleanTokens) {
            if (typeof token === 'number') {
                outputQueue.push(token);
            } else if (['+', '-', '*', '/'].includes(token)) {
                while (
                    operatorStack.length > 0 &&
                    ['+', '-', '*', '/'].includes(operatorStack[operatorStack.length - 1]) &&
                    precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        }

        while (operatorStack.length > 0) {
            outputQueue.push(operatorStack.pop());
        }

        const evaluationStack = [];
        for (const token of outputQueue) {
            if (typeof token === 'number') {
                evaluationStack.push(token);
            } else {
                const operand2 = evaluationStack.pop();
                const operand1 = evaluationStack.pop();
                if (operand1 === undefined || operand2 === undefined) {
                    return NaN;
                }
                let result;
                switch (token) {
                    case '+': result = operand1 + operand2; break;
                    case '-': result = operand1 - operand2; break;
                    case '*': result = operand1 * operand2; break;
                    case '/': 
                        if (operand2 === 0) {
                            return "Error: Div by 0";
                        }
                        result = operand1 / operand2; 
                        break;
                    default: return NaN;
                }
                evaluationStack.push(result);
            }
        }

        if (evaluationStack.length !== 1) {
            return NaN;
        }
        return evaluationStack.pop();
    }
}

if (!arithmeticUnitInstance) {
    arithmeticUnitInstance = new ComputationalUnit(defaultCalculationContext);
}
globalArithmeticProcessor = arithmeticUnitInstance;

if (this.controlPanelClearButton) {
    controlPanelClearButton.setOnClickListener(function() {
        globalArithmeticProcessor.resetAll();
    });
}

if (this.memoryStorageButton && this.memoryRecallButton) {
    memoryStorageButton.setOnClickListener(function() {
        globalArithmeticProcessor.saveToMemory();
    });
    
    memoryRecallButton.setOnClickListener(function() {
        globalArithmeticProcessor.retrieveFromMemory();
    });
}

if (typeof outputPanel !== 'undefined' && outputPanel.updateText) {
    outputPanel.updateText(globalArithmeticProcessor.retrieveDisplayValue());
}

console.log("Computational unit module loaded.");