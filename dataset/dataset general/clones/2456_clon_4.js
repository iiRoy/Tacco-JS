const TemplateEngine = {};

TemplateEngine.VER = "1.0.beta.6-reimagined";

TemplateEngine.assistants = {};
TemplateEngine.snippets = {};

TemplateEngine.enrollAssistant = (label, processorFunction, inverseFunction) => {
    if (inverseFunction) {
        processorFunction.negation = inverseFunction;
    }
    TemplateEngine.assistants[label] = processorFunction;
};

TemplateEngine.enrollSnippet = (label, contentString) => {
    TemplateEngine.snippets[label] = contentString;
};

TemplateEngine.enrollAssistant('missingAssistant', function(arg) {
    if (arguments.length === 2) {
        return undefined;
    } else {
        throw new Error("Cannot locate attribute '" + arg + "'");
    }
});

const objectTypeCheck = Object.prototype.toString;
const funcTypeIdentifier = "[object Function]";

TemplateEngine.enrollAssistant('missingBlockAssistant', function(entity, optionsObject) {
    const defaultNegation = optionsObject.negation || (() => "");
    const positiveAction = optionsObject.positive;

    let accumulatedResult = "";
    const entityKind = objectTypeCheck.call(entity);

    if (entityKind === funcTypeIdentifier) {
        entity = entity.call(this);
    }

    if (entity === true) {
        return positiveAction(this);
    } else if (entity === false || entity == null) {
        return defaultNegation(this);
    } else if (entityKind === "[object Array]") {
        if (entity.length > 0) {
            accumulatedResult = entity.reduce((acc, currentItem) => acc + positiveAction(currentItem), "");
        } else {
            accumulatedResult = defaultNegation(this);
        }
        return accumulatedResult;
    } else {
        return positiveAction(entity);
    }
});

TemplateEngine.enrollAssistant('iterateCollection', function(collection, optionsObject) {
    const positiveAction = optionsObject.positive;
    const defaultNegation = optionsObject.negation;
    let finalOutput = "";

    if (collection && collection.length > 0) {
        finalOutput = collection.reduce((acc, currentItem) => acc + positiveAction(currentItem), "");
    } else {
        finalOutput = defaultNegation(this);
    }
    return finalOutput;
});

TemplateEngine.util = {
    isVoid: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.length === 0) return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    }
};

TemplateEngine.enrollAssistant('conditionalCheck', function(conditionValue, optionsObject) {
    const conditionKind = objectTypeCheck.call(conditionValue);
    if (conditionKind === funcTypeIdentifier) {
        conditionValue = conditionValue.call(this);
    }

    if (!conditionValue || TemplateEngine.util.isVoid(conditionValue)) {
        return optionsObject.negation(this);
    } else {
        return optionsObject.positive(this);
    }
});

TemplateEngine.enrollAssistant('negatedConditional', function(conditionValue, optionsObject) {
    const positiveAction = optionsObject.positive;
    const defaultNegation = optionsObject.negation;
    optionsObject.positive = defaultNegation;
    optionsObject.negation = positiveAction;

    return TemplateEngine.assistants['conditionalCheck'].call(this, conditionValue, optionsObject);
});

TemplateEngine.enrollAssistant('contextualBlock', function(dataObject, optionsObject) {
    return optionsObject.positive(dataObject);
});

TemplateEngine.display = console.log;
TemplateEngine.enrollAssistant('outputMessage', function(message) {
    TemplateEngine.display(message);
});

// Parser section
const syntaxProcessor = (function() {

    const syntaxAnalyzer = {
        trace: function trace() {},
        runtimeEnv: {},
        tokenSymbolMap: {
            "error": 2,
            "documentRoot": 3,
            "mainProgram": 4,
            "END_OF_FILE": 5,
            "commandSequence": 6,
            "minorInverse": 7,
            "commandUnit": 8,
            "openInverseSection": 9,
            "closeBlockSection": 10,
            "openBlockSection": 11,
            "expressionTag": 12,
            "fragmentInclude": 13,
            "RAW_CONTENT": 14,
            "DOCUMENT_COMMENT": 15,
            "BLOCK_START_DELIM": 16,
            "insideTag": 17,
            "CLOSE_DELIM": 18,
            "INVERSE_START_DELIM": 19,
            "BLOCK_END_DELIM": 20,
            "pathReference": 21,
            "OPEN_DELIM": 22,
            "UNESCAPED_OPEN_DELIM": 23,
            "FRAGMENT_OPEN_DELIM": 24,
            "argumentList": 25,
            "keyValueMap": 26,
            "argumentItem": 27,
            "STRING_LITERAL": 28,
            "INTEGER_LITERAL": 29,
            "BOOLEAN_LITERAL": 30,
            "mapSegments": 31,
            "mapEntry": 32,
            "IDENTIFIER": 33,
            "ASSIGNMENT_OPERATOR": 34,
            "pathSegments": 35,
            "PATH_SEPARATOR": 36,
            "$accept": 0,
            "$end": 1
        },
        terminalSymbolNames: {
            2: "error",
            5: "END_OF_FILE",
            14: "RAW_CONTENT",
            15: "DOCUMENT_COMMENT",
            16: "BLOCK_START_DELIM",
            18: "CLOSE_DELIM",
            19: "INVERSE_START_DELIM",
            20: "BLOCK_END_DELIM",
            22: "OPEN_DELIM",
            23: "UNESCAPED_OPEN_DELIM",
            24: "FRAGMENT_OPEN_DELIM",
            28: "STRING_LITERAL",
            29: "INTEGER_LITERAL",
            30: "BOOLEAN_LITERAL",
            33: "IDENTIFIER",
            34: "ASSIGNMENT_OPERATOR",
            36: "PATH_SEPARATOR"
        },
        grammarRules: [
            0, [3, 2],
            [4, 3],
            [4, 1],
            [4, 0],
            [6, 1],
            [6, 2],
            [8, 3],
            [8, 3],
            [8, 1],
            [8, 1],
            [8, 1],
            [8, 1],
            [11, 3],
            [9, 3],
            [10, 3],
            [12, 3],
            [12, 3],
            [13, 3],
            [13, 4],
            [7, 2],
            [17, 3],
            [17, 2],
            [17, 2],
            [17, 1],
            [25, 2],
            [25, 1],
            [27, 1],
            [27, 1],
            [27, 1],
            [27, 1],
            [26, 1],
            [31, 2],
            [31, 1],
            [32, 3],
            [32, 3],
            [32, 3],
            [32, 3],
            [21, 1],
            [35, 3],
            [35, 1]
        ],
        executeGrammarAction: function(tokenData, tokenLength, lineNum, currentEnv, ruleIndex, valueStack, locationStack) {
            const topIndex = valueStack.length - 1;
            this.currentResult = undefined; // Renamed from this.$

            const nodeConstructors = currentEnv.nodeConstructors; // Access node constructors from runtimeEnv

            const actionMap = {
                1: () => valueStack[topIndex - 1],
                2: () => new nodeConstructors.TemplateStructure(valueStack[topIndex - 2], valueStack[topIndex]),
                3: () => new nodeConstructors.TemplateStructure(valueStack[topIndex]),
                4: () => new nodeConstructors.TemplateStructure([]),
                5: () => [valueStack[topIndex]],
                6: () => {
                    valueStack[topIndex - 1].push(valueStack[topIndex]);
                    return valueStack[topIndex - 1];
                },
                7: () => new nodeConstructors.NegatedSection(valueStack[topIndex - 2], valueStack[topIndex - 1], valueStack[topIndex]),
                8: () => new nodeConstructors.ContentBlock(valueStack[topIndex - 2], valueStack[topIndex - 1], valueStack[topIndex]),
                9: () => valueStack[topIndex],
                10: () => valueStack[topIndex],
                11: () => new nodeConstructors.StaticContent(valueStack[topIndex]),
                12: () => new nodeConstructors.IgnoredComment(valueStack[topIndex]),
                13: () => new nodeConstructors.ExpressionElement(valueStack[topIndex - 1][0], valueStack[topIndex - 1][1]),
                14: () => new nodeConstructors.ExpressionElement(valueStack[topIndex - 1][0], valueStack[topIndex - 1][1]),
                15: () => valueStack[topIndex - 1],
                16: () => new nodeConstructors.ExpressionElement(valueStack[topIndex - 1][0], valueStack[topIndex - 1][1]),
                17: () => new nodeConstructors.ExpressionElement(valueStack[topIndex - 1][0], valueStack[topIndex - 1][1], true),
                18: () => new nodeConstructors.FragmentInclusion(valueStack[topIndex - 1]),
                19: () => new nodeConstructors.FragmentInclusion(valueStack[topIndex - 2], valueStack[topIndex - 1]),
                20: () => {}, // Empty action
                21: () => [
                    [valueStack[topIndex - 2]].concat(valueStack[topIndex - 1]), valueStack[topIndex]
                ],
                22: () => [
                    [valueStack[topIndex - 1]].concat(valueStack[topIndex]), null
                ],
                23: () => [
                    [valueStack[topIndex - 1]], valueStack[topIndex]
                ],
                24: () => [
                    [valueStack[topIndex]], null
                ],
                25: () => {
                    valueStack[topIndex - 1].push(valueStack[topIndex]);
                    return valueStack[topIndex - 1];
                },
                26: () => [valueStack[topIndex]],
                27: () => valueStack[topIndex],
                28: () => new nodeConstructors.LiteralString(valueStack[topIndex]),
                29: () => new nodeConstructors.LiteralInteger(valueStack[topIndex]),
                30: () => new nodeConstructors.LiteralBoolean(valueStack[topIndex]),
                31: () => new nodeConstructors.ParameterMap(valueStack[topIndex]),
                32: () => {
                    valueStack[topIndex - 1].push(valueStack[topIndex]);
                    return valueStack[topIndex - 1];
                },
                33: () => [valueStack[topIndex]],
                34: () => [valueStack[topIndex - 2], valueStack[topIndex]],
                35: () => [valueStack[topIndex - 2], new nodeConstructors.LiteralString(valueStack[topIndex])],
                36: () => [valueStack[topIndex - 2], new nodeConstructors.LiteralInteger(valueStack[topIndex])],
                37: () => [valueStack[topIndex - 2], new nodeConstructors.LiteralBoolean(valueStack[topIndex])],
                38: () => new nodeConstructors.IdentifierReference(valueStack[topIndex]),
                39: () => {
                    valueStack[topIndex - 2].push(valueStack[topIndex]);
                    return valueStack[topIndex - 2];
                },
                40: () => [valueStack[topIndex]]
            };

            if (actionMap[ruleIndex]) {
                this.currentResult = actionMap[ruleIndex]();
            }

            return this.currentResult;
        },
        stateTransitionTable: [{
            3: 1,
            4: 2,
            5: [2, 4],
            6: 3,
            8: 4,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 11],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            1: [3]
        }, {
            5: [1, 16]
        }, {
            5: [2, 3],
            7: 17,
            8: 18,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 19],
            20: [2, 3],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            5: [2, 5],
            14: [2, 5],
            15: [2, 5],
            16: [2, 5],
            19: [2, 5],
            20: [2, 5],
            22: [2, 5],
            23: [2, 5],
            24: [2, 5]
        }, {
            4: 20,
            6: 3,
            8: 4,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 11],
            20: [2, 4],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            4: 21,
            6: 3,
            8: 4,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 11],
            20: [2, 4],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            5: [2, 9],
            14: [2, 9],
            15: [2, 9],
            16: [2, 9],
            19: [2, 9],
            20: [2, 9],
            22: [2, 9],
            23: [2, 9],
            24: [2, 9]
        }, {
            5: [2, 10],
            14: [2, 10],
            15: [2, 10],
            16: [2, 10],
            19: [2, 10],
            20: [2, 10],
            22: [2, 10],
            23: [2, 10],
            24: [2, 10]
        }, {
            5: [2, 11],
            14: [2, 11],
            15: [2, 11],
            16: [2, 11],
            19: [2, 11],
            20: [2, 11],
            22: [2, 11],
            23: [2, 11],
            24: [2, 11]
        }, {
            5: [2, 12],
            14: [2, 12],
            15: [2, 12],
            16: [2, 12],
            19: [2, 12],
            20: [2, 12],
            22: [2, 12],
            23: [2, 12],
            24: [2, 12]
        }, {
            17: 22,
            21: 23,
            33: [1, 25],
            35: 24
        }, {
            17: 26,
            21: 23,
            33: [1, 25],
            35: 24
        }, {
            17: 27,
            21: 23,
            33: [1, 25],
            35: 24
        }, {
            17: 28,
            21: 23,
            33: [1, 25],
            35: 24
        }, {
            21: 29,
            33: [1, 25],
            35: 24
        }, {
            1: [2, 1]
        }, {
            6: 30,
            8: 4,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 11],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            5: [2, 6],
            14: [2, 6],
            15: [2, 6],
            16: [2, 6],
            19: [2, 6],
            20: [2, 6],
            22: [2, 6],
            23: [2, 6],
            24: [2, 6]
        }, {
            17: 22,
            18: [1, 31],
            21: 23,
            33: [1, 25],
            35: 24
        }, {
            10: 32,
            20: [1, 33]
        }, {
            10: 34,
            20: [1, 33]
        }, {
            18: [1, 35]
        }, {
            18: [2, 24],
            21: 40,
            25: 36,
            26: 37,
            27: 38,
            28: [1, 41],
            29: [1, 42],
            30: [1, 43],
            31: 39,
            32: 44,
            33: [1, 45],
            35: 24
        }, {
            18: [2, 38],
            28: [2, 38],
            29: [2, 38],
            30: [2, 38],
            33: [2, 38],
            36: [1, 46]
        }, {
            18: [2, 40],
            28: [2, 40],
            29: [2, 40],
            30: [2, 40],
            33: [2, 40],
            36: [2, 40]
        }, {
            18: [1, 47]
        }, {
            18: [1, 48]
        }, {
            18: [1, 49]
        }, {
            18: [1, 50],
            21: 51,
            33: [1, 25],
            35: 24
        }, {
            5: [2, 2],
            8: 18,
            9: 5,
            11: 6,
            12: 7,
            13: 8,
            14: [1, 9],
            15: [1, 10],
            16: [1, 12],
            19: [1, 11],
            22: [1, 13],
            23: [1, 14],
            24: [1, 15]
        }, {
            14: [2, 20],
            15: [2, 20],
            16: [2, 20],
            19: [2, 20],
            22: [2, 20],
            23: [2, 20],
            24: [2, 20]
        }, {
            5: [2, 7],
            14: [2, 7],
            15: [2, 7],
            16: [2, 7],
            19: [2, 7],
            20: [2, 7],
            22: [2, 7],
            23: [2, 7],
            24: [2, 7]
        }, {
            21: 52,
            33: [1, 25],
            35: 24
        }, {
            5: [2, 8],
            14: [2, 8],
            15: [2, 8],
            16: [2, 8],
            19: [2, 8],
            20: [2, 8],
            22: [2, 8],
            23: [2, 8],
            24: [2, 8]
        }, {
            14: [2, 14],
            15: [2, 14],
            16: [2, 14],
            19: [2, 14],
            20: [2, 14],
            22: [2, 14],
            23: [2, 14],
            24: [2, 14]
        }, {
            18: [2, 22],
            21: 40,
            26: 53,
            27: 54,
            28: [1, 41],
            29: [1, 42],
            30: [1, 43],
            31: 39,
            32: 44,
            33: [1, 45],
            35: 24
        }, {
            18: [2, 23]
        }, {
            18: [2, 26],
            28: [2, 26],
            29: [2, 26],
            30: [2, 26],
            33: [2, 26]
        }, {
            18: [2, 31],
            32: 55,
            33: [1, 56]
        }, {
            18: [2, 27],
            28: [2, 27],
            29: [2, 27],
            30: [2, 27],
            33: [2, 27]
        }, {
            18: [2, 28],
            28: [2, 28],
            29: [2, 28],
            30: [2, 28],
            33: [2, 28]
        }, {
            18: [2, 29],
            28: [2, 29],
            29: [2, 29],
            30: [2, 29],
            33: [2, 29]
        }, {
            18: [2, 30],
            28: [2, 30],
            29: [2, 30],
            30: [2, 30],
            33: [2, 30]
        }, {
            18: [2, 33],
            33: [2, 33]
        }, {
            18: [2, 40],
            28: [2, 40],
            29: [2, 40],
            30: [2, 40],
            33: [2, 40],
            34: [1, 57],
            36: [2, 40]
        }, {
            33: [1, 58]
        }, {
            14: [2, 13],
            15: [2, 13],
            16: [2, 13],
            19: [2, 13],
            20: [2, 13],
            22: [2, 13],
            23: [2, 13],
            24: [2, 13]
        }, {
            5: [2, 16],
            14: [2, 16],
            15: [2, 16],
            16: [2, 16],
            19: [2, 16],
            20: [2, 16],
            22: [2, 16],
            23: [2, 16],
            24: [2, 16]
        }, {
            5: [2, 17],
            14: [2, 17],
            15: [2, 17],
            16: [2, 17],
            19: [2, 17],
            20: [2, 17],
            22: [2, 17],
            23: [2, 17],
            24: [2, 17]
        }, {
            5: [2, 18],
            14: [2, 18],
            15: [2, 18],
            16: [2, 18],
            19: [2, 18],
            20: [2, 18],
            22: [2, 18],
            23: [2, 18],
            24: [2, 18]
        }, {
            18: [1, 59]
        }, {
            18: [1, 60]
        }, {
            18: [2, 21]
        }, {
            18: [2, 25],
            28: [2, 25],
            29: [2, 25],
            30: [2, 25],
            33: [2, 25]
        }, {
            18: [2, 32],
            33: [2, 32]
        }, {
            34: [1, 57]
        }, {
            21: 61,
            28: [1, 62],
            29: [1, 63],
            30: [1, 64],
            33: [1, 25],
            35: 24
        }, {
            18: [2, 39],
            28: [2, 39],
            29: [2, 39],
            30: [2, 39],
            33: [2, 39],
            36: [2, 39]
        }, {
            5: [2, 19],
            14: [2, 19],
            15: [2, 19],
            16: [2, 19],
            19: [2, 19],
            20: [2, 19],
            22: [2, 19],
            23: [2, 19],
            24: [2, 19]
        }, {
            5: [2, 15],
            14: [2, 15],
            15: [2, 15],
            16: [2, 15],
            19: [2, 15],
            20: [2, 15],
            22: [2, 15],
            23: [2, 15],
            24: [2, 15]
        }, {
            18: [2, 34],
            33: [2, 34]
        }, {
            18: [2, 35],
            33: [2, 35]
        }, {
            18: [2, 36],
            33: [2, 36]
        }, {
            18: [2, 37],
            33: [2, 37]
        }],
        defaultStateActions: {
            16: [2, 1],
            37: [2, 23],
            53: [2, 21]
        },
        reportParseError: function reportParseError(message, context) {
            throw new Error(message);
        },
        processInput: function processInput(sourceText) {
            const currentInstance = this;
            const stateStack = [0];
            const valueStack = [null];
            const locationStack = [];
            const actionTable = this.stateTransitionTable;
            let tokenContent = "";
            let currentLine = 0;
            let currentTokenLength = 0;
            let recoveryFlag = 0;
            const ERROR_TOKEN_ID = 2;
            const END_OF_INPUT_TOKEN_ID = 1;

            this.tokenGenerator.configureInputSource(sourceText);
            this.tokenGenerator.runtimeEnv = this.runtimeEnv;
            this.runtimeEnv.tokenGenerator = this.tokenGenerator;

            if (typeof this.tokenGenerator.locationInfo === "undefined")
                this.tokenGenerator.locationInfo = {};
            let currentLocation = this.tokenGenerator.locationInfo;
            locationStack.push(currentLocation);

            if (typeof this.runtimeEnv.reportParseError === "function")
                this.reportParseError = this.runtimeEnv.reportParseError;

            function popStacks(count) {
                stateStack.length -= 2 * count;
                valueStack.length -= count;
                locationStack.length -= count;
            }

            function fetchToken() {
                let currentToken;
                currentToken = currentInstance.tokenGenerator.fetchNextToken() || END_OF_INPUT_TOKEN_ID;
                if (typeof currentToken !== "number") {
                    currentToken = currentInstance.tokenSymbolMap[currentToken] || currentToken;
                }
                return currentToken;
            }

            let symbolValue, priorErrorSymbol, currentState, actionCode, actionDetail, ruleLength, newTokenState, expectedSymbols;
            let actionResult = {};

            while (true) {
                currentState = stateStack[stateStack.length - 1];
                if (this.defaultStateActions[currentState]) {
                    actionCode = this.defaultStateActions[currentState];
                } else {
                    if (symbolValue == null)
                        symbolValue = fetchToken();
                    actionCode = actionTable[currentState] && actionTable[currentState][symbolValue];
                }

                if (typeof actionCode === "undefined" || !actionCode.length || !actionCode[0]) {
                    if (!recoveryFlag) {
                        expectedSymbols = [];
                        for (let p in actionTable[currentState])
                            if (this.terminalSymbolNames[p] && p > 2) {
                                expectedSymbols.push("'" + this.terminalSymbolNames[p] + "'");
                            }
                        let errorMsg = "";
                        if (this.tokenGenerator.indicatePosition) {
                            errorMsg = "Syntax error on line " + (currentLine + 1) + ":\n" + this.tokenGenerator.indicatePosition() + "\nExpected " + expectedSymbols.join(", ") + ", got '" + this.terminalSymbolNames[symbolValue] + "'";
                        } else {
                            errorMsg = "Syntax error on line " + (currentLine + 1) + ": Unexpected " + (symbolValue == END_OF_INPUT_TOKEN_ID ? "end of input" : "'" + (this.terminalSymbolNames[symbolValue] || symbolValue) + "'");
                        }
                        this.reportParseError(errorMsg, {
                            text: this.tokenGenerator.currentMatch,
                            token: this.terminalSymbolNames[symbolValue] || symbolValue,
                            line: this.tokenGenerator.currentLineNum,
                            loc: currentLocation,
                            expected: expectedSymbols
                        });
                    }
                }
                if (Array.isArray(actionCode[0]) && actionCode.length > 1) {
                    throw new Error("Parse Error: multiple actions possible at state: " + currentState + ", token: " + symbolValue);
                }
                switch (actionCode[0]) {
                    case 1: // Shift
                        stateStack.push(symbolValue);
                        valueStack.push(this.tokenGenerator.tokenContent);
                        locationStack.push(this.tokenGenerator.locationInfo);
                        stateStack.push(actionCode[1]);
                        symbolValue = null;
                        if (!priorErrorSymbol) {
                            currentTokenLength = this.tokenGenerator.tokenLength;
                            tokenContent = this.tokenGenerator.tokenContent;
                            currentLine = this.tokenGenerator.currentLineNum;
                            currentLocation = this.tokenGenerator.locationInfo;
                            if (recoveryFlag > 0)
                                recoveryFlag--;
                        } else {
                            symbolValue = priorErrorSymbol;
                            priorErrorSymbol = null;
                        }
                        break;
                    case 2: // Reduce
                        ruleLength = this.grammarRules[actionCode[1]][1];
                        actionResult.currentResult = valueStack[valueStack.length - ruleLength];
                        actionResult.locationData = {
                            first_line: locationStack[locationStack.length - (ruleLength || 1)].first_line,
                            last_line: locationStack[locationStack.length - 1].last_line,
                            first_column: locationStack[locationStack.length - (ruleLength || 1)].first_column,
                            last_column: locationStack[locationStack.length - 1].last_column
                        };
                        let ruleResult = this.executeGrammarAction.call(actionResult, tokenContent, currentTokenLength, currentLine, this.runtimeEnv, actionCode[1], valueStack, locationStack);
                        if (typeof ruleResult !== "undefined") {
                            return ruleResult;
                        }
                        if (ruleLength) {
                            stateStack.length -= (ruleLength * 2);
                            valueStack.length -= ruleLength;
                            locationStack.length -= ruleLength;
                        }
                        stateStack.push(this.grammarRules[actionCode[1]][0]);
                        valueStack.push(actionResult.currentResult);
                        locationStack.push(actionResult.locationData);
                        newTokenState = actionTable[stateStack[stateStack.length - 2]][stateStack[stateStack.length - 1]];
                        stateStack.push(newTokenState);
                        break;
                    case 3: // Accept
                        return true;
                }
            }
            return true;
        }
    };

    // Node Constructors for AST
    function TemplateStructure(elements, inversePart) {
        this.programElements = elements;
        this.alternativeProgram = inversePart;
    }

    function NegatedSection(openInfo, program, closeInfo) {
        this.opening = openInfo;
        this.body = program;
        this.closing = closeInfo;
    }

    function ContentBlock(openInfo, program, closeInfo) {
        this.blockOpen = openInfo;
        this.blockContent = program;
        this.blockClose = closeInfo;
    }

    function ExpressionElement(path, args, unescaped = false) {
        this.expressionPath = path;
        this.expressionArgs = args;
        this.isUnescaped = unescaped;
    }

    function FragmentInclusion(name, params) {
        this.fragmentName = name;
        this.fragmentParams = params;
    }

    function StaticContent(value) {
        this.staticValue = value;
    }

    function IgnoredComment(value) {
        this.commentText = value;
    }

    function LiteralString(value) {
        this.stringValue = value;
    }

    function LiteralInteger(value) {
        this.intValue = value;
    }

    function LiteralBoolean(value) {
        this.boolValue = value;
    }

    function ParameterMap(entries) {
        this.mapEntries = entries;
    }

    function IdentifierReference(id) {
        this.identifier = id;
    }

    syntaxAnalyzer.runtimeEnv.nodeConstructors = {
        TemplateStructure,
        NegatedSection,
        ContentBlock,
        ExpressionElement,
        FragmentInclusion,
        StaticContent,
        IgnoredComment,
        LiteralString,
        LiteralInteger,
        LiteralBoolean,
        ParameterMap,
        IdentifierReference
    };

    const tokenGenerator = (function() {

        const lexerInstance = ({
            EOF: 1,
            reportParseError: function(message, context) {
                if (this.runtimeEnv.reportParseError) {
                    this.runtimeEnv.reportParseError(message, context);
                } else {
                    throw new Error(message);
                }
            },
            configureInputSource: function(inputString) {
                this.sourceInput = inputString;
                this.moreToMatch = this.lessMatched = this.finished = false;
                this.currentLineNum = this.tokenLength = 0;
                this.tokenContent = this.currentMatch = this.matchedText = '';
                this.modeStack = ['INITIAL'];
                this.locationInfo = {
                    first_line: 1,
                    first_column: 0,
                    last_line: 1,
                    last_column: 0
                };
                return this;
            },
            readCharacter: function() {
                const char = this.sourceInput[0];
                this.tokenContent += char;
                this.tokenLength++;
                this.currentMatch += char;
                this.matchedText += char;
                const lineBreaks = char.match(/\n/);
                if (lineBreaks) this.currentLineNum++;
                this.sourceInput = this.sourceInput.slice(1);
                return char;
            },
            returnCharacter: function(char) {
                this.sourceInput = char + this.sourceInput;
                return this;
            },
            extendMatch: function() {
                this.moreToMatch = true;
                return this;
            },
            getPastText: function() {
                const past = this.matchedText.substring(0, this.matchedText.length - this.currentMatch.length);
                return (past.length > 20 ? '...' : '') + past.substring(-20).replace(/\n/g, "");
            },
            getUpcomingText: function() {
                let upcoming = this.currentMatch;
                if (upcoming.length < 20) {
                    upcoming += this.sourceInput.substring(0, 20 - upcoming.length);
                }
                return (upcoming.substring(0, 20) + (upcoming.length > 20 ? '...' : '')).replace(/\n/g, "");
            },
            indicatePosition: function() {
                const prefix = this.getPastText();
                const indicator = new Array(prefix.length + 1).join("-");
                return prefix + this.getUpcomingText() + "\n" + indicator + "^";
            },
            fetchNextToken: function() {
                if (this.finished) {
                    return this.EOF;
                }
                if (!this.sourceInput) this.finished = true;

                let tokenSymbol,
                    currentMatchResult,
                    lineBreaks;
                if (!this.moreToMatch) {
                    this.tokenContent = '';
                    this.currentMatch = '';
                }
                const activeRules = this.getCurrentStateRules();
                for (let i = 0; i < activeRules.length; i++) {
                    currentMatchResult = this.regexRules[activeRules[i]].exec(this.sourceInput);
                    if (currentMatchResult) {
                        lineBreaks = currentMatchResult[0].match(/\n.*/g);
                        if (lineBreaks) this.currentLineNum += lineBreaks.length;
                        this.locationInfo = {
                            first_line: this.locationInfo.last_line,
                            last_line: this.currentLineNum + 1,
                            first_column: this.locationInfo.last_column,
                            last_column: lineBreaks ? lineBreaks[lineBreaks.length - 1].length - 1 : this.locationInfo.last_column + currentMatchResult[0].length
                        };
                        this.tokenContent += currentMatchResult[0];
                        this.currentMatch += currentMatchResult[0];
                        this.matches = currentMatchResult;
                        this.tokenLength = this.tokenContent.length;
                        this.moreToMatch = false;
                        this.sourceInput = this.sourceInput.slice(currentMatchResult[0].length);
                        this.matchedText += currentMatchResult[0];
                        tokenSymbol = this.executeLexerAction.call(this, this.runtimeEnv, this, activeRules[i], this.modeStack[this.modeStack.length - 1]);
                        if (tokenSymbol) return tokenSymbol;
                        else return;
                    }
                }
                if (this.sourceInput === "") {
                    return this.EOF;
                } else {
                    this.reportParseError('Lexical error on line ' + (this.currentLineNum + 1) + '. Unrecognized text.\n' + this.indicatePosition(), {
                        text: "",
                        token: null,
                        line: this.currentLineNum
                    });
                }
            },
            produceToken: function produceToken() {
                const result = this.fetchNextToken();
                if (typeof result !== 'undefined') {
                    return result;
                } else {
                    return this.produceToken();
                }
            },
            startState: function(stateName) {
                this.modeStack.push(stateName);
            },
            endState: function() {
                return this.modeStack.pop();
            },
            getCurrentStateRules: function() {
                return this.stateConditions[this.modeStack[this.modeStack.length - 1]].rules;
            },
            peekState: function() {
                return this.modeStack[this.modeStack.length - 2];
            },
            addStateToStack: function(stateName) {
                this.startState(stateName);
            }
        });

        const lexerActionExecutors = [];

        lexerActionExecutors[0] = (tokenContext, currentLexer) => {
            if (tokenContext.tokenContent.slice(-1) !== "\\") currentLexer.startState("tagMode");
            if (tokenContext.tokenContent.slice(-1) === "\\") tokenContext.tokenContent = tokenContext.tokenContent.substring(0, tokenContext.tokenLength - 1), currentLexer.startState("escapedTagMode");
            if (tokenContext.tokenContent) return 14;
        };
        lexerActionExecutors[1] = () => 14;
        lexerActionExecutors[2] = (tokenContext, currentLexer) => {
            currentLexer.endState();
            return 14;
        };
        lexerActionExecutors[3] = () => 24;
        lexerActionExecutors[4] = () => 16;
        lexerActionExecutors[5] = () => 20;
        lexerActionExecutors[6] = () => 19;
        lexerActionExecutors[7] = () => 19;
        lexerActionExecutors[8] = () => 23;
        lexerActionExecutors[9] = () => 23;
        lexerActionExecutors[10] = (tokenContext, currentLexer) => {
            tokenContext.tokenContent = tokenContext.tokenContent.substring(3, tokenContext.tokenLength - 5);
            currentLexer.endState();
            return 15;
        };
        lexerActionExecutors[11] = () => 22;
        lexerActionExecutors[12] = () => 34;
        lexerActionExecutors[13] = () => 33;
        lexerActionExecutors[14] = () => 33;
        lexerActionExecutors[15] = () => 36;
        lexerActionExecutors[16] = () => {}; // Ignore whitespace
        lexerActionExecutors[17] = (tokenContext, currentLexer) => {
            currentLexer.endState();
            return 18;
        };
        lexerActionExecutors[18] = (tokenContext, currentLexer) => {
            currentLexer.endState();
            return 18;
        };
        lexerActionExecutors[19] = (tokenContext) => {
            tokenContext.tokenContent = tokenContext.tokenContent.substring(1, tokenContext.tokenLength - 2).replace(/\\"/g, '"');
            return 28;
        };
        lexerActionExecutors[20] = () => 30;
        lexerActionExecutors[21] = () => 30;
        lexerActionExecutors[22] = () => 29;
        lexerActionExecutors[23] = () => 33;
        lexerActionExecutors[24] = (tokenContext) => {
            tokenContext.tokenContent = tokenContext.tokenContent.substring(1, tokenContext.tokenLength - 2);
            return 33;
        };
        lexerActionExecutors[25] = () => 'INVALID_TOKEN';
        lexerActionExecutors[26] = () => 5;

        lexerInstance.executeLexerAction = function(currentEnv, currentLexer, ruleIdx, currentState) {
            return lexerActionExecutors[ruleIdx](currentLexer, currentLexer, ruleIdx, currentState);
        };

        lexerInstance.regexRules = [/^[^\x00]*?(?=(\{\{))/, /^[^\x00]+/, /^[^\x00]{2,}?(?=(\{\{))/, /^\{\{>/, /^\{\{#/, /^\{\{\//, /^\{\{\^/, /^\{\{\s*else\b/, /^\{\{\{/, /^\{\{&/, /^\{\{![\s\S]*?\}\}/, /^\{\{/, /^=/, /^\.(?=[} ])/, /^\.\./, /^[\/.]/, /^\s+/, /^\}\}\}/, /^\}\}/, /^"(\\["]|[^"])*"/, /^true(?=[}\s])/, /^false(?=[}\s])/, /^[0-9]+(?=[}\s])/, /^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/, /^\[[^\]]*\]/, /^./, /^$/];
        lexerInstance.stateConditions = {
            "tagMode": {
                "rules": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                "inclusive": false
            },
            "escapedTagMode": {
                "rules": [2],
                "inclusive": false
            },
            "INITIAL": {
                "rules": [0, 1, 26],
                "inclusive": true
            }
        };
        return lexerInstance;
    })();
    syntaxAnalyzer.tokenGenerator = tokenGenerator;
    return syntaxAnalyzer;
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.syntaxAnalyzer = syntaxProcessor;
    exports.process = function() {
        return syntaxProcessor.processInput.apply(syntaxProcessor, arguments);
    };
    exports.mainRoutine = function commonjsMain(args) {
        if (!args[1])
            throw new Error('Usage: ' + args[0] + ' FILE_PATH');
        if (typeof process !== 'undefined') {
            const fileSystem = require('fs');
            const pathModule = require('path');
            const sourceCode = fileSystem.readFileSync(pathModule.join(process.cwd(), args[1]), "utf8");
            return exports.syntaxAnalyzer.processInput(sourceCode);
        } else {
            const fileModule = require("file");
            const currentWorkingDir = fileModule.path(fileModule.cwd());
            const sourceCode = currentWorkingDir.join(args[1]).read({
                charset: "utf-8"
            });
            return exports.syntaxAnalyzer.processInput(sourceCode);
        }
    };
    if (typeof module !== 'undefined' && require.main === module) {
        exports.mainRoutine(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
    }
}