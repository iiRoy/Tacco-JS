var outputConsole = console.log;

if (typeof process !== "undefined") {
    var rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(incomingChunk) {
        rawInputData += incomingChunk;
    });
    process.stdin.on('end', function() {
        var inputRecords = rawInputData.split("\n");
        rootExecution(inputRecords);
    });
}

function rootExecution(records) {
    records.forEach(function(currentRecord) {
        if (currentRecord !== "#") {
            handleSingleLine(currentRecord);
        }
    });
}

const MODULO_CONSTANT = 1000000007;

function applySquareMod(value) {
    let numericValue = Number(value);
    if (numericValue > 500000000) {
        numericValue = numericValue - MODULO_CONSTANT;
    }
    const squaredResult = numericValue * numericValue;
    return squaredResult % MODULO_CONSTANT;
}

function computeShiftValue(baseValue, exponentValue) {
    return Math.trunc(baseValue / (2 ** exponentValue));
}

const SYMBOL_TYPES = {
    NUMBER_LITERAL: 'NUM',
    OPEN_BRACKET: 'OPB',
    CLOSE_BRACKET: 'CLB',
    RIGHT_SHIFT_OPERATOR: 'RSH'
};

function generateTokenStream(expressionInput) {
    let cleanExpression = expressionInput.replace(/S|\s/g, '');

    const tokenRecognitionRegex = /\d+|>>|<|>/g;
    let currentMatch;
    const recognizedSymbols = [];

    while ((currentMatch = tokenRecognitionRegex.exec(cleanExpression)) !== null) {
        const symbolText = currentMatch[0];
        if (symbolText === '<') {
            recognizedSymbols.push({ type: SYMBOL_TYPES.OPEN_BRACKET });
        } else if (symbolText === '>') {
            recognizedSymbols.push({ type: SYMBOL_TYPES.CLOSE_BRACKET });
        } else if (symbolText === '>>') {
            recognizedSymbols.push({ type: SYMBOL_TYPES.RIGHT_SHIFT_OPERATOR });
        } else if (!isNaN(Number(symbolText))) {
            recognizedSymbols.push({ type: SYMBOL_TYPES.NUMBER_LITERAL, val: Number(symbolText) });
        } else {
            // This path should ideally not be reached with the current regex
            throw new Error("Lexical analysis error: Unrecognized symbol " + symbolText);
        }
    }
    return recognizedSymbols;
}

function processSyntacticTree(symbolSequence) {
    let symbolPointer = 0;

    function fetchCurrentSymbol() {
        return symbolSequence[symbolPointer];
    }

    function advanceSymbol() {
        return symbolSequence[symbolPointer++];
    }

    function demandSymbol(requiredType) {
        const current = fetchCurrentSymbol();
        if (!current || current.type !== requiredType) {
            throw new Error(`Parsing fault: Expected ${requiredType} but encountered ${current ? current.type : 'EOF'}`);
        }
        return advanceSymbol();
    }

    // Grammar:
    // Calculation ::= Component (RIGHT_SHIFT_OPERATOR Calculation)?
    // Component ::= NUMBER_LITERAL | OPEN_BRACKET Calculation CLOSE_BRACKET

    function parseComponent() {
        const symbol = fetchCurrentSymbol();
        if (!symbol) {
            throw new Error("Parsing fault: Unexpected end of input, expecting component.");
        }

        if (symbol.type === SYMBOL_TYPES.NUMBER_LITERAL) {
            return advanceSymbol().val;
        } else if (symbol.type === SYMBOL_TYPES.OPEN_BRACKET) {
            advanceSymbol(); // Consume OPEN_BRACKET
            const innerCalculationResult = parseCalculation();
            demandSymbol(SYMBOL_TYPES.CLOSE_BRACKET); // Consume CLOSE_BRACKET
            return applySquareMod(innerCalculationResult); // Apply S() operation
        } else {
            throw new Error(`Parsing fault: Expected numeric value or '(' but encountered ${symbol.type}`);
        }
    }

    function parseCalculation() {
        let leftOperand = parseComponent();

        if (fetchCurrentSymbol() && fetchCurrentSymbol().type === SYMBOL_TYPES.RIGHT_SHIFT_OPERATOR) {
            advanceSymbol(); // Consume RIGHT_SHIFT_OPERATOR
            const rightOperand = parseCalculation(); // Recursive call for right-associativity
            leftOperand = computeShiftValue(leftOperand, rightOperand);
        }
        return leftOperand;
    }

    const finalComputationResult = parseCalculation();

    if (symbolPointer < symbolSequence.length) {
        throw new Error("Parsing fault: Unconsumed symbols at end of expression.");
    }

    return finalComputationResult;
}

function handleSingleLine(inputLine) {
    const symbols = generateTokenStream(inputLine);
    const finalValue = processSyntacticTree(symbols);
    outputConsole(finalValue);
}