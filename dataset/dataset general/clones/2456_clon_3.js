// engine/core/render_base.js
const TemplateEngine = {};

// Engine version information and metadata
TemplateEngine.ENGINE_VERSION_INFO = {
    major: 1,
    minor: 0,
    patch: 6,
    status: "beta",
    full: "1.0.beta.6"
};

// Storage for custom rendering functions
TemplateEngine.registeredHelpers  = {};
// Storage for reusable template fragments
TemplateEngine.partialTemplates = {};

/**
 * Defines a custom helper function for the template engine.
 * @param {string} helperName - The name of the helper.
 * @param {Function} helperFn - The main function for the helper.
 * @param {Function} [alternativeFn] - An optional inverse function for block helpers.
 */
TemplateEngine.defineHelper = function(helperName, helperFn, alternativeFn) {
	// Attach the alternative function if provided, for block helpers
	if (alternativeFn) {
        helperFn.alt = alternativeFn;
    }
	this.registeredHelpers[helperName] = helperFn;
};

/**
 * Stores a reusable partial template string.
 * @param {string} partialName - The name of the partial.
 * @param {string} templateString - The template string content.
 */
TemplateEngine.storePartial = function(partialName, templateString) {
    if (typeof templateString !== 'string') {
        console.warn(`TemplateEngine: Attempted to store non-string partial '${partialName}'. Ignoring.`);
        return;
    }
	this.partialTemplates[partialName] = templateString;
};

// Utility for object type checking
const objectTypeChecker = Object.prototype.toString;
const FUNCTION_TYPE_STRING = "[object Function]";

// Register a default helper for handling missing properties
TemplateEngine.defineHelper('missingHelperHandler', function(missingKey) {
    // If there are exactly two arguments, it implies a simple missing value, return nothing.
    // Otherwise, it's a call to a non-existent helper, which should throw.
	if (arguments.length === 2) {
		return undefined;
	} else {
        // Construct a descriptive error message using template literals
		throw new Error(`Template rendering error: Property or helper '${missingKey}' could not be resolved.`);
	}
});

// Register a robust block helper for common conditional/looping logic
TemplateEngine.defineHelper('defaultBlockProcessor', function(dataObject, renderOptions) {
    // Ensure we always have an inverse function, even if it's a no-op
	const alternateRenderer = renderOptions.inverse || (() => "");
    // The main rendering function
    const mainRenderer = renderOptions.fn;

    // Initialize output buffer
	let outputBuffer = "";
    // Determine the type of the data object for dynamic handling
	const valueKind = objectTypeChecker.call(dataObject);

    // If the data is a function, execute it to get the actual value
	if (valueKind === FUNCTION_TYPE_STRING) {
        dataObject = dataObject.call(this);
    }

    // Handle boolean true case
	if (dataObject === true) {
		return mainRenderer(this);
	}
    // Handle falsy or nullish cases
	else if (dataObject === false || dataObject == null) {
		return alternateRenderer(this);
	}
    // Handle array iteration
	else if (valueKind === "[object Array]") {
		if (dataObject.length > 0) {
            // Iterate through array elements
			for (let idx = 0, len = dataObject.length; idx < len; idx++) {
				outputBuffer += mainRenderer(dataObject[idx]);
			}
		} else {
            // If array is empty, render the inverse
			outputBuffer = alternateRenderer(this);
		}
		return outputBuffer;
	}
    // Default case: render with the data object
	else {
		return mainRenderer(dataObject);
	}
});

// Helper for iterating over collections
TemplateEngine.defineHelper('iterateItems', function(collection, renderOptions) {
	const mainRenderFn = renderOptions.fn;
    const alternateRenderFn = renderOptions.inverse;
	let accumulatedOutput = "";

    // Check if the collection is valid and has items
	if (collection && collection.length > 0) {
        // Iterate and accumulate rendered items
		for (let i = 0, j = collection.length; i < j; i++) {
			accumulatedOutput += mainRenderFn(collection[i]);
		}
	} else {
        // If no items, render the alternate content
		accumulatedOutput = alternateRenderFn(this);
	}
	return accumulatedOutput;
});

// Utility for checking emptiness
TemplateEngine.Utils = {
    isEmpty: function(value) {
        if (value === null || value === undefined) {
            return true;
        }
        if (typeof value === 'object') {
            if (Array.isArray(value) || typeof value.length === 'number') { // Check for arrays or array-like objects
                return value.length === 0;
            }
            return Object.keys(value).length === 0; // Check for empty objects
        }
        return false; // Non-object, non-null, non-undefined are not considered empty
    }
};

// Conditional rendering helper (if)
TemplateEngine.defineHelper('conditionalRender', function(conditionValue, renderOptions) {
    // Resolve function values
	let resolvedCondition = conditionValue;
	if (objectTypeChecker.call(conditionValue) === FUNCTION_TYPE_STRING) {
        resolvedCondition = conditionValue.call(this);
    }

    // Render inverse if condition is falsy or empty
	if (!resolvedCondition || TemplateEngine.Utils.isEmpty(resolvedCondition)) {
		return renderOptions.inverse(this);
	} else {
        // Otherwise, render the main content
		return renderOptions.fn(this);
	}
});

// Negated conditional rendering helper (unless)
TemplateEngine.defineHelper('negatedConditionalRender', function(conditionValue, renderOptions) {
    // Swap the main and inverse rendering functions for 'unless' logic
	const originalMainFn = renderOptions.fn;
    const originalInverseFn = renderOptions.inverse;

    // Create a new options object to avoid modifying the original
    const modifiedOptions = {
        fn: originalInverseFn,
        inverse: originalMainFn
    };

    // Delegate to the main conditional helper with swapped functions
	return TemplateEngine.registeredHelpers['conditionalRender'].call(this, conditionValue, modifiedOptions);
});

// Helper for changing context
TemplateEngine.defineHelper('contextualRender', function(newContext, renderOptions) {
    // Simply render the main function with the provided new context
	return renderOptions.fn(newContext);
});

// Logging helper
TemplateEngine.defineHelper('outputDebugMessage', function(messageContent) {
    // Use the engine's built-in log mechanism
	TemplateEngine.log(messageContent);
});

// Default logging implementation
TemplateEngine.log = function(msg) {
    console.log(`[TemplateEngine Debug] ${msg}`);
};

// engine/compiler/syntax_analyzer.js
/* Automatically generated syntax analyzer */
const templateGrammar = (function(){

	const syntaxAnalyzer = {
        trace: function traceAnalysis() { /* Placeholder for detailed tracing */ },
		context: {}, // Renamed from yy
		tokenSymbolsMap: {"error":2,"root":3,"program":4,"END_OF_INPUT":5,"statements":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT_TEXT":14,"COMMENT_BLOCK":15,"OPENING_BLOCK_TAG":16,"inMustache":17,"CLOSING_TAG":18,"OPENING_INVERSE_TAG":19,"OPENING_ENDBLOCK_TAG":20,"referencePath":21,"OPENING_TAG":22,"OPENING_UNESCAPED_TAG":23,"OPENING_PARTIAL_TAG":24,"parametersList":25,"hashArguments":26,"parameterItem":27,"STRING_LITERAL":28,"INTEGER_LITERAL":29,"BOOLEAN_LITERAL":30,"hashSegments":31,"hashSegment":32,"IDENTIFIER":33,"ASSIGNMENT_OPERATOR":34,"pathSegments":35,"PATH_SEPARATOR":36,"$accept":0,"$end":1},
		terminalTokensMap: {2:"error",5:"END_OF_INPUT",14:"CONTENT_TEXT",15:"COMMENT_BLOCK",16:"OPENING_BLOCK_TAG",18:"CLOSING_TAG",19:"OPENING_INVERSE_TAG",20:"OPENING_ENDBLOCK_TAG",22:"OPENING_TAG",23:"OPENING_UNESCAPED_TAG",24:"OPENING_PARTIAL_TAG",28:"STRING_LITERAL",29:"INTEGER_LITERAL",30:"BOOLEAN_LITERAL",33:"IDENTIFIER",34:"ASSIGNMENT_OPERATOR",36:"PATH_SEPARATOR"},
		grammarProductions: [0,[3,2],[4,3],[4,1],[4,0],[6,1],[6,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[7,2],[17,3],[17,2],[17,2],[17,1],[25,2],[25,1],[27,1],[27,1],[27,1],[27,1],[26,1],[31,2],[31,1],[32,3],[32,3],[32,3],[32,3],[21,1],[35,3],[35,1]],
		executeProductionAction: function anonymous(currentTokenText, currentTokenLength, currentLineNumber, context, stateId, valueStack, locationStack) {

			const lastIndex = valueStack.length - 1;
			switch (stateId) {
				case 1: return valueStack[lastIndex - 1];
				case 2: this.$ = new context.ProgramNode(valueStack[lastIndex - 2], valueStack[lastIndex]); break;
				case 3: this.$ = new context.ProgramNode(valueStack[lastIndex]); break;
				case 4: this.$ = new context.ProgramNode([]); break;
				case 5: this.$ = [valueStack[lastIndex]]; break;
				case 6: valueStack[lastIndex - 1].push(valueStack[lastIndex]); this.$ = valueStack[lastIndex - 1]; break;
				case 7: this.$ = new context.InverseNode(valueStack[lastIndex - 2], valueStack[lastIndex - 1], valueStack[lastIndex]); break;
				case 8: this.$ = new context.BlockNode(valueStack[lastIndex - 2], valueStack[lastIndex - 1], valueStack[lastIndex]); break;
				case 9: this.$ = valueStack[lastIndex]; break;
				case 10: this.$ = valueStack[lastIndex]; break;
				case 11: this.$ = new context.ContentNode(valueStack[lastIndex]); break;
				case 12: this.$ = new context.CommentNode(valueStack[lastIndex]); break;
				case 13: this.$ = new context.MustacheNode(valueStack[lastIndex - 1][0], valueStack[lastIndex - 1][1]); break;
				case 14: this.$ = new context.MustacheNode(valueStack[lastIndex - 1][0], valueStack[lastIndex - 1][1]); break;
				case 15: this.$ = valueStack[lastIndex - 1]; break;
				case 16: this.$ = new context.MustacheNode(valueStack[lastIndex - 1][0], valueStack[lastIndex - 1][1]); break;
				case 17: this.$ = new context.MustacheNode(valueStack[lastIndex - 1][0], valueStack[lastIndex - 1][1], true); break;
				case 18: this.$ = new context.PartialNode(valueStack[lastIndex - 1]); break;
				case 19: this.$ = new context.PartialNode(valueStack[lastIndex - 2], valueStack[lastIndex - 1]); break;
				case 20: /* no action */ break;
				case 21: this.$ = [[valueStack[lastIndex - 2]].concat(valueStack[lastIndex - 1]), valueStack[lastIndex]]; break;
				case 22: this.$ = [[valueStack[lastIndex - 1]].concat(valueStack[lastIndex]), null]; break;
				case 23: this.$ = [[valueStack[lastIndex - 1]], valueStack[lastIndex]]; break;
				case 24: this.$ = [[valueStack[lastIndex]], null]; break;
				case 25: valueStack[lastIndex - 1].push(valueStack[lastIndex]); this.$ = valueStack[lastIndex - 1]; break;
				case 26: this.$ = [valueStack[lastIndex]]; break;
				case 27: this.$ = valueStack[lastIndex]; break;
				case 28: this.$ = new context.StringNode(valueStack[lastIndex]); break;
				case 29: this.$ = new context.IntegerNode(valueStack[lastIndex]); break;
				case 30: this.$ = new context.BooleanNode(valueStack[lastIndex]); break;
				case 31: this.$ = new context.HashNode(valueStack[lastIndex]); break;
				case 32: valueStack[lastIndex - 1].push(valueStack[lastIndex]); this.$ = valueStack[lastIndex - 1]; break;
				case 33: this.$ = [valueStack[lastIndex]]; break;
				case 34: this.$ = [valueStack[lastIndex - 2], valueStack[lastIndex]]; break;
				case 35: this.$ = [valueStack[lastIndex - 2], new context.StringNode(valueStack[lastIndex])]; break;
				case 36: this.$ = [valueStack[lastIndex - 2], new context.IntegerNode(valueStack[lastIndex])]; break;
				case 37: this.$ = [valueStack[lastIndex - 2], new context.BooleanNode(valueStack[lastIndex])]; break;
				case 38: this.$ = new context.IdNode(valueStack[lastIndex]); break;
				case 39: valueStack[lastIndex - 2].push(valueStack[lastIndex]); this.$ = valueStack[lastIndex - 2]; break;
				case 40: this.$ = [valueStack[lastIndex]]; break;
			}
		},
		parsingTable: [{3:1,4:2,5:[2,4],6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{1:[3]},{5:[1,16]},{5:[2,3],7:17,8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,19],20:[2,3],22:[1,13],23:[1,14],24:[1,15]},{5:[2,5],14:[2,5],15:[2,5],16:[2,5],19:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5]},{4:20,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{4:21,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{17:22,21:23,33:[1,25],35:24},{17:26,21:23,33:[1,25],35:24},{17:27,21:23,33:[1,25],35:24},{17:28,21:23,33:[1,25],35:24},{21:29,33:[1,25],35:24},{1:[2,1]},{6:30,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{5:[2,6],14:[2,6],15:[2,6],16:[2,6],19:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6]},{17:22,18:[1,31],21:23,33:[1,25],35:24},{10:32,20:[1,33]},{10:34,20:[1,33]},{18:[1,35]},{18:[2,24],21:40,25:36,26:37,27:38,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,38],28:[2,38],29:[2,38],30:[2,38],33:[2,38],36:[1,46]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],36:[2,40]},{18:[1,47]},{18:[1,48]},{18:[1,49]},{18:[1,50],21:51,33:[1,25],35:24},{5:[2,2],8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{14:[2,20],15:[2,20],16:[2,20],19:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,7],14:[2,7],15:[2,7],16:[2,7],19:[2,7],20:[2,7],22:[2,7],23:[2,7],24:[2,7]},{21:52,33:[1,25],35:24},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{18:[2,22],21:40,26:53,27:54,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,23]},{18:[2,26],28:[2,26],29:[2,26],30:[2,26],33:[2,26]},{18:[2,31],32:55,33:[1,56]},{18:[2,27],28:[2,27],29:[2,27],30:[2,27],33:[2,27]},{18:[2,28],28:[2,28],29:[2,28],30:[2,28],33:[2,28]},{18:[2,29],28:[2,29],29:[2,29],30:[2,29],33:[2,29]},{18:[2,30],28:[2,30],29:[2,30],30:[2,30],33:[2,30]},{18:[2,33],33:[2,33]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],34:[1,57],36:[2,40]},{33:[1,58]},{14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,17],14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]},{18:[1,59]},{18:[1,60]},{18:[2,21]},{18:[2,25],28:[2,25],29:[2,25],30:[2,25],33:[2,25]},{18:[2,32],33:[2,32]},{34:[1,57]},{21:61,28:[1,62],29:[1,63],30:[1,64],33:[1,25],35:24},{18:[2,39],28:[2,39],29:[2,39],30:[2,39],33:[2,39],36:[2,39]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{18:[2,34],33:[2,34]},{18:[2,35],33:[2,35]},{18:[2,36],33:[2,36]},{18:[2,37],33:[2,37]}],
		defaultActions: {16:[2,1],37:[2,23],53:[2,21]},
		handleParsingError: function handleParsingError(errorMessage, errorHash) {
			throw new Error(errorMessage);
		},
		processInput: function processInput(sourceCode) {
			const currentAnalyzer = this;
            // Optionally enable verbose logging for debugging
            const VERBOSE_MODE = false;
            if (VERBOSE_MODE) console.log("Starting parsing process...");

            let parseStack = [0]; // The state stack
            let valueStack = [null]; // The semantic value stack
            let locationStack = []; // The location info stack

            const parsingTable = this.parsingTable;
            let currentTokenText = "";
            let currentTokenLength = 0;
            let currentLineNumber = 0;
            let errorRecoveryCounter = 0;
            const ERROR_TOKEN_ID = 2; // Token ID for 'error'
            const END_OF_FILE_TOKEN = 1; // Token ID for 'EOF'

			this.tokenStreamProcessor.configureInput(sourceCode);
			this.tokenStreamProcessor.context = this.context;
			this.context.tokenStreamProcessor = this.tokenStreamProcessor;

			if (typeof this.tokenStreamProcessor.matchLocation === "undefined") {
				this.tokenStreamProcessor.matchLocation = {};
            }
			let locationInfo = this.tokenStreamProcessor.matchLocation;
			locationStack.push(locationInfo); // Push initial location

			if (typeof this.context.handleParsingError === "function") {
				this.handleParsingError = this.context.handleParsingError;
            }

            /**
             * Reduces the stack depth by a given number of productions.
             * @param {number} numProductions - The number of productions to pop.
             */
			function reduceStackDepth(numProductions) {
				parseStack.length = parseStack.length - 2 * numProductions;
				valueStack.length = valueStack.length - numProductions;
				locationStack.length = locationStack.length - numProductions;
			}

            /**
             * Retrieves the next token from the lexer.
             * @returns {number|string} The token ID or name.
             */
			function getNextToken() {
				let identifiedToken;
				identifiedToken = currentAnalyzer.tokenStreamProcessor.getToken() || END_OF_FILE_TOKEN;
				if (typeof identifiedToken !== "number") {
					identifiedToken = currentAnalyzer.tokenSymbolsMap[identifiedToken] || identifiedToken;
				}
				return identifiedToken;
			}

			let currentSymbol, previousErrorSymbol, currentState, currentAction, actionResult, productionResult, semanticValue = {}, productionLength, nextState, expectedTokens;

			while (true) {
				currentState = parseStack[parseStack.length - 1];
				if (this.defaultActions[currentState]) {
					currentAction = this.defaultActions[currentState];
				} else {
					if (currentSymbol == null) {
						currentSymbol = getNextToken();
                    }
					currentAction = parsingTable[currentState] && parsingTable[currentState][currentSymbol];
				}

				if (typeof currentAction === "undefined" || !currentAction.length || !currentAction[0]) {
					if (!errorRecoveryCounter) {
						expectedTokens = [];
						for (const p in parsingTable[currentState]) {
							if (this.terminalTokensMap[p] && p > 2) {
								expectedTokens.push("'" + this.terminalTokensMap[p] + "'");
							}
                        }
						let errorDescription = "";
						if (this.tokenStreamProcessor.displayErrorPosition) {
							errorDescription = `Parse error on line ${currentLineNumber + 1}:\n${this.tokenStreamProcessor.displayErrorPosition()}\nExpecting ${expectedTokens.join(", ")}, got '${this.terminalTokensMap[currentSymbol]}'`;
						} else {
							errorDescription = `Parse error on line ${currentLineNumber + 1}: Unexpected ${currentSymbol === END_OF_FILE_TOKEN ? "end of input" : "'" + (this.terminalTokensMap[currentSymbol] || currentSymbol) + "'"}`;
						}
						this.handleParsingError(errorDescription, {text: this.tokenStreamProcessor.currentMatch, token: this.terminalTokensMap[currentSymbol] || currentSymbol, line: this.tokenStreamProcessor.lineNum, loc: locationInfo, expected: expectedTokens});
					}
				}

				if (currentAction[0] instanceof Array && currentAction.length > 1) {
					throw new Error(`Parse Error: Multiple actions possible at state: ${currentState}, token: ${currentSymbol}`);
				}

				switch (currentAction[0]) {
					case 1: // Shift
						parseStack.push(currentSymbol);
						valueStack.push(this.tokenStreamProcessor.matchText);
						locationStack.push(this.tokenStreamProcessor.matchLocation);
						parseStack.push(currentAction[1]);
						currentSymbol = null;
						if (!previousErrorSymbol) {
							currentTokenLength = this.tokenStreamProcessor.matchLen;
							currentTokenText = this.tokenStreamProcessor.matchText;
							currentLineNumber = this.tokenStreamProcessor.lineNum;
							locationInfo = this.tokenStreamProcessor.matchLocation;
							if (errorRecoveryCounter > 0) {
								errorRecoveryCounter--;
                            }
						} else {
							currentSymbol = previousErrorSymbol;
							previousErrorSymbol = null;
						}
						break;
					case 2: // Reduce
						productionLength = this.grammarProductions[currentAction[1]][1];
						semanticValue.$ = valueStack[valueStack.length - productionLength];
						semanticValue._$ = {first_line: locationStack[locationStack.length - (productionLength || 1)].first_line, last_line: locationStack[locationStack.length - 1].last_line, first_column: locationStack[locationStack.length - (productionLength || 1)].first_column, last_column: locationStack[locationStack.length - 1].last_column};
						productionResult = this.executeProductionAction.call(semanticValue, currentTokenText, currentTokenLength, currentLineNumber, this.context, currentAction[1], valueStack, locationStack);
						if (typeof productionResult !== "undefined") {
							return productionResult;
						}
						if (productionLength) {
							parseStack = parseStack.slice(0, -1 * productionLength * 2);
							valueStack = valueStack.slice(0, -1 * productionLength);
							locationStack = locationStack.slice(0, -1 * productionLength);
						}
						parseStack.push(this.grammarProductions[currentAction[1]][0]);
						valueStack.push(semanticValue.$);
						locationStack.push(semanticValue._$);
						nextState = parsingTable[parseStack[parseStack.length - 2]][parseStack[parseStack.length - 1]];
						parseStack.push(nextState);
						break;
					case 3: // Accept
						return true;
				}
			}
			return true; // Should ideally be unreachable
		}
	};
    /* Jison generated lexer */
	const tokenStreamProcessor = (function(){

		const lexer = ({EOF:1, // End of File token ID
			parseError:function parseError(message, hash) {
				if (this.context.handleParsingError) {
					this.context.handleParsingError(message, hash);
				} else {
					throw new Error(message);
				}
			},
			configureInput:function (inputString) {
				this.rawInput = inputString;
				this.isMoreToMatch = this.isLessToMatch = this.isInputExhausted = false;
				this.lineNum = this.matchLen = 0;
				this.matchText = this.totalMatchedText = this.currentMatch = '';
				this.lexerConditionStack = ['INITIAL'];
				this.matchLocation = {first_line:1,first_column:0,last_line:1,last_column:0};
				return this;
			},
			consumeChar:function () {
				const char = this.rawInput[0];
				this.matchText += char;
				this.matchLen++;
				this.currentMatch += char;
				const lineBreaks = char.match(/\n/);
				if (lineBreaks) this.lineNum++;
				this.rawInput = this.rawInput.slice(1);
				return char;
			},
			unconsumeChar:function (charToUnput) {
				this.rawInput = charToUnput + this.rawInput;
				return this;
			},
			continueMatch:function () {
				this.isMoreToMatch = true;
				return this;
			},
			getPastInputSnippet:function () {
				const pastSegment = this.totalMatchedText.substring(0, this.totalMatchedText.length - this.currentMatch.length);
				return (pastSegment.length > 20 ? '...':'') + pastSegment.substring(-20).replace(/\n/g, "");
			},
			getUpcomingInputSnippet:function () {
				let nextSegment = this.currentMatch;
				if (nextSegment.length < 20) {
					nextSegment += this.rawInput.substring(0, 20 - nextSegment.length);
				}
				return (nextSegment.substring(0,20)+(nextSegment.length > 20 ? '...':'')).replace(/\n/g, "");
			},
			displayErrorPosition:function () {
				const pastSnippet = this.getPastInputSnippet();
				const caretLine = new Array(pastSnippet.length + 1).join("-");
				return pastSnippet + this.getUpcomingInputSnippet() + "\n" + caretLine + "^";
			},
			advanceToken:function () {
				if (this.isInputExhausted) {
					return this.EOF;
				}
				if (!this.rawInput) this.isInputExhausted = true;

				let identifiedToken;
				let regexMatch;
				let matchedLines;
				if (!this.isMoreToMatch) {
					this.matchText = '';
					this.currentMatch = '';
				}
				const activeRules = this.getCurrentConditionRules();
				for (let ruleIdx = 0; ruleIdx < activeRules.length; ruleIdx++) {
					regexMatch = this.lexerRules[activeRules[ruleIdx]].exec(this.rawInput); // Changed match to exec to get groups
					if (regexMatch) {
                        // The regexMatch[0] is the full match string.
						matchedLines = regexMatch[0].match(/\n.*/g);
						if (matchedLines) this.lineNum += matchedLines.length;
						this.matchLocation = {
                            first_line: this.matchLocation.last_line,
							last_line: this.lineNum + 1,
							first_column: this.matchLocation.last_column,
							last_column: matchedLines ? matchedLines[matchedLines.length-1].length - 1 : this.matchLocation.last_column + regexMatch[0].length
                        }
						this.matchText += regexMatch[0];
						this.currentMatch += regexMatch[0];
						this.matches = regexMatch; // Store all match groups
						this.matchLen = this.matchText.length;
						this.isMoreToMatch = false;
						this.rawInput = this.rawInput.slice(regexMatch[0].length);
						this.totalMatchedText += regexMatch[0];
						identifiedToken = this.executeLexerAction.call(this, this.context, this, activeRules[ruleIdx], this.lexerConditionStack[this.lexerConditionStack.length-1]);
						if (identifiedToken) return identifiedToken;
						else return; // If action didn't return a token, continue lexing
					}
				}
				if (this.rawInput === "") {
					return this.EOF;
				} else {
					this.parseError(`Lexical error on line ${this.lineNum + 1}. Unrecognized text.\n${this.displayErrorPosition()}`,
						{text: "", token: null, line: this.lineNum});
				}
			},
			getToken:function getToken() {
				const result = this.advanceToken();
				if (typeof result !== 'undefined') {
					return result;
				} else {
					return this.getToken(); // Recurse if no token returned (e.g., whitespace ignored)
				}
			},
			enterCondition:function enterCondition(conditionName) {
				this.lexerConditionStack.push(conditionName);
			},
			exitCondition:function exitCondition() {
				return this.lexerConditionStack.pop();
			},
			getCurrentConditionRules:function getCurrentConditionRules() {
				return this.lexerConditions[this.lexerConditionStack[this.lexerConditionStack.length-1]].rules;
			},
			getPreviousCondition:function () {
				return this.lexerConditionStack[this.lexerConditionStack.length-2];
			},
			pushCondition:function pushCondition(conditionName) {
				this.enterCondition(conditionName);
			}
        });
		lexer.executeLexerAction = function anonymous(context, lexerInstance, ruleIndex, CURRENT_LEXER_STATE) {

			switch(ruleIndex) {
				case 0:
					if(lexerInstance.matchText.slice(-1) !== "\\") lexerInstance.enterCondition("mustache_state");
					if(lexerInstance.matchText.slice(-1) === "\\") lexerInstance.matchText = lexerInstance.matchText.substring(0, lexerInstance.matchLen - 1), lexerInstance.enterCondition("escaped_mustache_state");
					if(lexerInstance.matchText) return 14; // CONTENT_TEXT
					break;
				case 1: return 14; // CONTENT_TEXT
				case 2: lexerInstance.exitCondition(); return 14; // CONTENT_TEXT
				case 3: return 24; // OPENING_PARTIAL_TAG
				case 4: return 16; // OPENING_BLOCK_TAG
				case 5: return 20; // OPENING_ENDBLOCK_TAG
				case 6: return 19; // OPENING_INVERSE_TAG
				case 7: return 19; // OPENING_INVERSE_TAG for else
				case 8: return 23; // OPENING_UNESCAPED_TAG
				case 9: return 23; // OPENING_UNESCAPED_TAG for ampersand
				case 10: lexerInstance.matchText = lexerInstance.matchText.substring(3, lexerInstance.matchLen - 5); lexerInstance.exitCondition(); return 15; // COMMENT_BLOCK
				case 11: return 22; // OPENING_TAG
				case 12: return 34; // ASSIGNMENT_OPERATOR
				case 13: return 33; // IDENTIFIER (dot)
				case 14: return 33; // IDENTIFIER (dot-dot)
				case 15: return 36; // PATH_SEPARATOR
				case 16: /* Ignore whitespace */ break;
				case 17: lexerInstance.exitCondition(); return 18; // CLOSING_TAG (triple)
				case 18: lexerInstance.exitCondition(); return 18; // CLOSING_TAG (double)
				case 19: lexerInstance.matchText = lexerInstance.matchText.substring(1, lexerInstance.matchLen - 2).replace(/\\"/g,'"'); return 28; // STRING_LITERAL
				case 20: return 30; // BOOLEAN_LITERAL (true)
				case 21: return 30; // BOOLEAN_LITERAL (false)
				case 22: return 29; // INTEGER_LITERAL
				case 23: return 33; // IDENTIFIER (alphanumeric)
				case 24: lexerInstance.matchText = lexerInstance.matchText.substring(1, lexerInstance.matchLen - 2); return 33; // IDENTIFIER (bracketed)
				case 25: return 'INVALID_TOKEN'; // Unrecognized character
				case 26: return 5; // END_OF_INPUT
			}
		};
		lexer.lexerRules = [
            /^[^\x00]*?(?=(\{\{))/, // Rule 0: Content up to a mustache
            /^[^\x00]+/,             // Rule 1: Any content (fallback)
            /^[^\x00]{2,}?(?=(\{\{))/,// Rule 2: Content in escaped mustache state
            /^\{\{>/,                // Rule 3: Partial tag
            /^\{\{#/,                // Rule 4: Block tag
            /^\{\{\//,               // Rule 5: End block tag
            /^\{\{\^/,               // Rule 6: Inverse block tag
            /^\{\{\s*else\b/,        // Rule 7: Else keyword
            /^\{\{\{/,               // Rule 8: Unescaped triple mustache
            /^\{\{&/,                // Rule 9: Unescaped ampersand
            /^\{\{![\s\S]*?\}\}/,    // Rule 10: Comment block
            /^\{\{/,                 // Rule 11: Opening mustache tag
            /^=/,                    // Rule 12: Assignment operator
            /^\.(?=[} ])/,           // Rule 13: Single dot (path segment)
            /^\.\./,                 // Rule 14: Double dot (parent path)
            /^[\/.]/,                // Rule 15: Path separator
            /^\s+/,                  // Rule 16: Whitespace (ignored)
            /^\}\}\}/,               // Rule 17: Closing triple mustache
            /^\}\}/,                 // Rule 18: Closing double mustache
            /^"(\\["]|[^"])*"/,      // Rule 19: String literal
            /^true(?=[}\s])/,        // Rule 20: Boolean true
            /^false(?=[}\s])/,       // Rule 21: Boolean false
            /^[0-9]+(?=[}\s])/,      // Rule 22: Integer literal
            /^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/,// Rule 23: Identifier (alphanumeric)
            /^\[[^\]]*\]/,           // Rule 24: Bracketed identifier
            /^./,                    // Rule 25: Any other character (error)
            /^$/                     // Rule 26: End of input
        ];
		lexer.lexerConditions = {
            "mustache_state": {rules:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],"inclusive":false},
            "escaped_mustache_state": {rules:[2],"inclusive":false},
            "INITIAL": {rules:[0,1,26],"inclusive":true}
        };
        return lexer;
    })();
	syntaxAnalyzer.tokenStreamProcessor = tokenStreamProcessor;
	return syntaxAnalyzer;
})();

// CommonJS/Node.js export compatibility
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.parser = templateGrammar;
	exports.parse = function (inputSource) {
        // Simple wrapper for parsing
        if (typeof inputSource !== 'string') {
            throw new TypeError("Input to parse must be a string.");
        }
        return templateGrammar.processInput(inputSource);
    };
	exports.main = function executeCommandLineParser(args) {
		if (args.length < 2 || !args[1]) {
			throw new Error('Usage: ' + args[0] + ' <TEMPLATE_FILE_PATH>');
        }

        let fileContent;
		if (typeof process !== 'undefined' && process.versions && process.versions.node) { // Check for Node.js environment
			const fs = require('fs');
            const path = require('path');
            const filePath = path.join(process.cwd(), args[1]);
            fileContent = fs.readFileSync(filePath, "utf8");
		} else {
            // Fallback for non-Node.js CommonJS environments (e.g. RingoJS, Rhino)
            // This part might need further adaptation for specific environments
			const cwd = require("file").path(require("file").cwd());
			fileContent = cwd.join(args[1]).read({charset: "utf-8"});
		}
		return exports.parser.processInput(fileContent);
	};

	// Execute main function if this script is run directly
	if (typeof module !== 'undefined' && require.main === module) {
		exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
	}
}