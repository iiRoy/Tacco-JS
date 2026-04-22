// framework/templating/kernel.js
var TemplateEngine = {};

// Current revision of the templating system
TemplateEngine.TOOL_REV = "v1.0-beta-6";

// Storage for registered assistance functions
TemplateEngine.assistants = {};
// Storage for reusable template fragments
TemplateEngine.fragments = {};

/**
 * Registers a new assistance function for use in templates.
 * @param {string} label - The name to register the assistant under.
 * @param {Function} action - The main function for the assistant.
 * @param {Function} [reverseAction] - An optional inverse function for block assistants.
 */
TemplateEngine.enrollAssistant = function(label, action, reverseAction) {
	if ( reverseAction ) {
		action.not = reverseAction;
	}
	this.assistants[label] = action;
};

/**
 * Registers a reusable template fragment.
 * @param {string} label - The name for the fragment.
 * @param {string} chunk - The template string content of the fragment.
 */
TemplateEngine.enrollFragment = function(label, chunk) {
	this.fragments[label] = chunk;
};

// Define a placeholder for utility methods
TemplateEngine.UtilityFunctions = {
	/**
	 * Checks if a value is considered "void" or empty.
	 * @param {*} val - The value to check.
	 * @returns {boolean} - True if the value is void/empty, false otherwise.
	 */
	isVoid: function(val) {
		if ( typeof val === 'undefined' || val === null ) {
			return true;
		}
		if ( Array.isArray(val) && val.length === 0 ) {
			return true;
		}
		if ( typeof val === 'object' && Object.keys(val).length === 0 ) {
			return true;
		}
		return false;
	}
};


// Default assistant for handling missing helper calls
TemplateEngine.enrollAssistant('missingAssistant', function(itemRef) {
	if ( arguments.length === 2 ) {
		return void 0; // Return undefined if called with two args
	} else {
		throw new Error("Cannot locate property '" + itemRef + "'");
	}
});

var objectString = Object.prototype.toString, funcKind = "[object Function]";

// Assistant for handling block helper logic
TemplateEngine.enrollAssistant('blockAssistantMissing', function(dataObject, configSettings) {
	var reverseAction = configSettings.inverse || function() {
		},
		action = configSettings.fn;


	var resultBuffer = "";
	var dataKind = objectString.call(dataObject);

	if ( dataKind === funcKind ) {
		dataObject = dataObject.call(this);
	}

	if ( dataObject === true ) {
		return action(this);
	} else if ( dataObject === false || dataObject == null ) {
		return reverseAction(this);
	} else if ( dataKind === "[object Array]" ) {
		if ( dataObject.length > 0 ) {
			for ( var idx = 0, lim = dataObject.length; idx < lim; idx++ ) {
				resultBuffer = resultBuffer + action(dataObject[idx]);
			}
		} else {
			resultBuffer = reverseAction(this);
		}
		return resultBuffer;
	} else {
		return action(dataObject);
	}
});

// Assistant for iterating over collections
TemplateEngine.enrollAssistant('iterateOver', function(dataObject, configSettings) {
	var action = configSettings.fn,
		reverseAction = configSettings.inverse;
	var resultBuffer = "";

	if ( dataObject && dataObject.length > 0 ) {
		for ( var idx = 0, lim = dataObject.length; idx < lim; idx++ ) {
			resultBuffer = resultBuffer + action(dataObject[idx]);
		}
	} else {
		resultBuffer = reverseAction(this);
	}
	return resultBuffer;
});

// Conditional assistant
TemplateEngine.enrollAssistant('conditional', function(dataObject, configSettings) {
	var dataKind = objectString.call(dataObject);
	if ( dataKind === funcKind ) {
		dataObject = dataObject.call(this);
	}

	if ( !dataObject || TemplateEngine.UtilityFunctions.isVoid(dataObject) ) {
		return configSettings.inverse(this);
	} else {
		return configSettings.fn(this);
	}
});

// Negated conditional assistant
TemplateEngine.enrollAssistant('negateConditional', function(dataObject, configSettings) {
	var action = configSettings.fn,
		reverseAction = configSettings.inverse;
	configSettings.fn = reverseAction;
	configSettings.inverse = action;

	return TemplateEngine.assistants['conditional'].call(this, dataObject, configSettings);
});

// Scope context assistant
TemplateEngine.enrollAssistant('scopeContext', function(dataObject, configSettings) {
	return configSettings.fn(dataObject);
});

// Logging assistant
TemplateEngine.enrollAssistant('recordEvent', function(dataObject) {
	TemplateEngine.log(dataObject);
});
;
// framework/templating/syntax-processor.js
/* Jison-driven syntax processor */
var templateGrammar = ( function() {

	var syntaxAnalyzer = {
		debugTrace: function debugTrace() {
		},
		yystateInfo: {},
		symbolMap: {
			"parseErr": 2,
			"baseNode": 3,
			"codeUnit": 4,
			"END_OF_FILE": 5,
			"exprList": 6,
			"basicElse": 7,
			"codeExpr": 8,
			"invBlockStart": 9,
			"blockEnd": 10,
			"blockStart": 11,
			"interpolation": 12,
			"snippet": 13,
			"RAW_TEXT": 14,
			"CODE_COMMENT": 15,
			"BLOCK_DELIM_OPEN": 16,
			"withinInterpolation": 17,
			"DELIM_CLOSE": 18,
			"INVERSE_DELIM_OPEN": 19,
			"ENDBLOCK_DELIM_OPEN": 20,
			"nodePath": 21,
			"DELIM_OPEN": 22,
			"UNESC_DELIM_OPEN": 23,
			"SNIPPET_DELIM_OPEN": 24,
			"argList": 25,
			"optionMap": 26,
			"singleArg": 27,
			"TEXT_LITERAL": 28,
			"NUM_LITERAL": 29,
			"BOOL_LITERAL": 30,
			"optionParts": 31,
			"optionPart": 32,
			"IDENTIFIER": 33,
			"ASSIGN_OP": 34,
			"pathParts": 35,
			"PATH_SEP": 36,
			"ACCEPT_STATE": 0,
			"FINAL_STATE": 1
		},
		terminalMap: {
			2: "parseErr",
			5: "END_OF_FILE",
			14: "RAW_TEXT",
			15: "CODE_COMMENT",
			16: "BLOCK_DELIM_OPEN",
			18: "DELIM_CLOSE",
			19: "INVERSE_DELIM_OPEN",
			20: "ENDBLOCK_DELIM_OPEN",
			22: "DELIM_OPEN",
			23: "UNESC_DELIM_OPEN",
			24: "SNIPPET_DELIM_OPEN",
			28: "TEXT_LITERAL",
			29: "NUM_LITERAL",
			30: "BOOL_LITERAL",
			33: "IDENTIFIER",
			34: "ASSIGN_OP",
			36: "PATH_SEP"
		},
		ruleSet: [0, [3, 2], [4, 3], [4, 1], [4, 0], [6, 1], [6, 2], [8, 3], [8, 3], [8, 1], [8, 1], [8, 1], [8, 1], [11, 3], [9, 3], [10, 3], [12, 3], [12, 3], [13, 3], [13, 4], [7, 2], [17, 3], [17, 2], [17, 2], [17, 1], [25, 2], [25, 1], [27, 1], [27, 1], [27, 1], [27, 1], [26, 1], [31, 2], [31, 1], [32, 3], [32, 3], [32, 3], [32, 3], [21, 1], [35, 3], [35, 1]],
		executeRule: function anonymous(currentText, textLength, lineNum, stateData, productionState, stackValues, locInfo) {

			var topIndex = stackValues.length - 1;
			switch (productionState) {
				case 1:
					this.$ = stackValues[topIndex - 1]
					break;
				case 2:
					this.$ = new stateData.ProgramNode(stackValues[topIndex - 2], stackValues[topIndex])
					break;
				case 3:
					this.$ = new stateData.ProgramNode(stackValues[topIndex])
					break;
				case 4:
					this.$ = new stateData.ProgramNode([])
					break;
				case 5:
					this.$ = [stackValues[topIndex]]
					break;
				case 6:
					stackValues[topIndex - 1].push(stackValues[topIndex]);
					this.$ = stackValues[topIndex - 1]
					break;
				case 7:
					this.$ = new stateData.InverseNode(stackValues[topIndex - 2], stackValues[topIndex - 1], stackValues[topIndex])
					break;
				case 8:
					this.$ = new stateData.BlockNode(stackValues[topIndex - 2], stackValues[topIndex - 1], stackValues[topIndex])
					break;
				case 9:
					this.$ = stackValues[topIndex]
					break;
				case 10:
					this.$ = stackValues[topIndex]
					break;
				case 11:
					this.$ = new stateData.ContentNode(stackValues[topIndex])
					break;
				case 12:
					this.$ = new stateData.CommentNode(stackValues[topIndex])
					break;
				case 13:
					this.$ = new stateData.InterpolationNode(stackValues[topIndex - 1][0], stackValues[topIndex - 1][1])
					break;
				case 14:
					this.$ = new stateData.InterpolationNode(stackValues[topIndex - 1][0], stackValues[topIndex - 1][1])
					break;
				case 15:
					this.$ = stackValues[topIndex - 1]
					break;
				case 16:
					this.$ = new stateData.InterpolationNode(stackValues[topIndex - 1][0], stackValues[topIndex - 1][1])
					break;
				case 17:
					this.$ = new stateData.InterpolationNode(stackValues[topIndex - 1][0], stackValues[topIndex - 1][1], true)
					break;
				case 18:
					this.$ = new stateData.SnippetNode(stackValues[topIndex - 1])
					break;
				case 19:
					this.$ = new stateData.SnippetNode(stackValues[topIndex - 2], stackValues[topIndex - 1])
					break;
				case 20:
					break;
				case 21:
					this.$ = [[stackValues[topIndex - 2]].concat(stackValues[topIndex - 1]), stackValues[topIndex]]
					break;
				case 22:
					this.$ = [[stackValues[topIndex - 1]].concat(stackValues[topIndex]), null]
					break;
				case 23:
					this.$ = [[stackValues[topIndex - 1]], stackValues[topIndex]]
					break;
				case 24:
					this.$ = [[stackValues[topIndex]], null]
					break;
				case 25:
					stackValues[topIndex - 1].push(stackValues[topIndex]);
					this.$ = stackValues[topIndex - 1];
					break;
				case 26:
					this.$ = [stackValues[topIndex]]
					break;
				case 27:
					this.$ = stackValues[topIndex]
					break;
				case 28:
					this.$ = new stateData.TextNode(stackValues[topIndex])
					break;
				case 29:
					this.$ = new stateData.NumericNode(stackValues[topIndex])
					break;
				case 30:
					this.$ = new stateData.BooleanNode(stackValues[topIndex])
					break;
				case 31:
					this.$ = new stateData.OptionNode(stackValues[topIndex])
					break;
				case 32:
					stackValues[topIndex - 1].push(stackValues[topIndex]);
					this.$ = stackValues[topIndex - 1]
					break;
				case 33:
					this.$ = [stackValues[topIndex]]
					break;
				case 34:
					this.$ = [stackValues[topIndex - 2], stackValues[topIndex]]
					break;
				case 35:
					this.$ = [stackValues[topIndex - 2], new stateData.TextNode(stackValues[topIndex])]
					break;
				case 36:
					this.$ = [stackValues[topIndex - 2], new stateData.NumericNode(stackValues[topIndex])]
					break;
				case 37:
					this.$ = [stackValues[topIndex - 2], new stateData.BooleanNode(stackValues[topIndex])]
					break;
				case 38:
					this.$ = new stateData.IdentifierNode(stackValues[topIndex])
					break;
				case 39:
					stackValues[topIndex - 2].push(stackValues[topIndex]);
					this.$ = stackValues[topIndex - 2];
					break;
				case 40:
					this.$ = [stackValues[topIndex]]
					break;
			}
		},
		transitionTable: [
			{
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
			},
			{1: [3]},
			{5: [1, 16]},
			{
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
			},
			{
				5: [2, 5],
				14: [2, 5],
				15: [2, 5],
				16: [2, 5],
				19: [2, 5],
				20: [2, 5],
				22: [2, 5],
				23: [2, 5],
				24: [2, 5]
			},
			{
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
			},
			{
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
			},
			{
				5: [2, 9],
				14: [2, 9],
				15: [2, 9],
				16: [2, 9],
				19: [2, 9],
				20: [2, 9],
				22: [2, 9],
				23: [2, 9],
				24: [2, 9]
			},
			{
				5: [2, 10],
				14: [2, 10],
				15: [2, 10],
				16: [2, 10],
				19: [2, 10],
				20: [2, 10],
				22: [2, 10],
				23: [2, 10],
				24: [2, 10]
			},
			{
				5: [2, 11],
				14: [2, 11],
				15: [2, 11],
				16: [2, 11],
				19: [2, 11],
				20: [2, 11],
				22: [2, 11],
				23: [2, 11],
				24: [2, 11]
			},
			{
				5: [2, 12],
				14: [2, 12],
				15: [2, 12],
				16: [2, 12],
				19: [2, 12],
				20: [2, 12],
				22: [2, 12],
				23: [2, 12],
				24: [2, 12]
			},
			{17: 22, 21: 23, 33: [1, 25], 35: 24},
			{17: 26, 21: 23, 33: [1, 25], 35: 24},
			{17: 27, 21: 23, 33: [1, 25], 35: 24},
			{17: 28, 21: 23, 33: [1, 25], 35: 24},
			{21: 29, 33: [1, 25], 35: 24},
			{1: [2, 1]},
			{
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
			},
			{
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
				20: [2, 2],
				22: [1, 13],
				23: [1, 14],
				24: [1, 15]
			},
			{17: 22, 18: [1, 31], 21: 23, 33: [1, 25], 35: 24},
			{10: 32, 20: [1, 33]},
			{10: 34, 20: [1, 33]},
			{18: [1, 35]},
			{
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
			},
			{18: [2, 38], 28: [2, 38], 29: [2, 38], 30: [2, 38], 33: [1, 25], 35: 24, 36: [1, 46]},
			{18: [2, 40], 28: [2, 40], 29: [2, 40], 30: [2, 40], 33: [2, 40], 36: [2, 40]},
			{18: [1, 47]},
			{18: [1, 48]},
			{18: [1, 49]},
			{18: [1, 50], 21: 51, 33: [1, 25], 35: 24},
			{
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
			},
			{14: [2, 20], 15: [2, 20], 16: [2, 20], 19: [2, 20], 22: [2, 20], 23: [2, 20], 24: [2, 20]},
			{
				5: [2, 7],
				14: [2, 7],
				15: [2, 7],
				16: [2, 7],
				19: [2, 7],
				20: [2, 7],
				22: [2, 7],
				23: [2, 7],
				24: [2, 7]
			},
			{21: 52, 33: [1, 25], 35: 24},
			{
				5: [2, 8],
				14: [2, 8],
				15: [2, 8],
				16: [2, 8],
				19: [2, 8],
				20: [2, 8],
				22: [2, 8],
				23: [2, 8],
				24: [2, 8]
			},
			{
				14: [2, 14],
				15: [2, 14],
				16: [2, 14],
				19: [2, 14],
				20: [2, 14],
				22: [2, 14],
				23: [2, 14],
				24: [2, 14]
			},
			{
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
			},
			{18: [2, 23]},
			{18: [2, 26], 28: [2, 26], 29: [2, 26], 30: [2, 26], 33: [2, 26]},
			{18: [2, 31], 32: 55, 33: [1, 56]},
			{18: [2, 27], 28: [2, 27], 29: [2, 27], 30: [2, 27], 33: [2, 27]},
			{18: [2, 28], 28: [2, 28], 29: [2, 28], 30: [2, 28], 33: [2, 28]},
			{18: [2, 29], 28: [2, 29], 29: [2, 29], 30: [2, 29], 33: [2, 29]},
			{18: [2, 30], 28: [2, 30], 29: [2, 30], 30: [2, 30], 33: [2, 30]},
			{18: [2, 33], 33: [2, 33]},
			{18: [2, 40], 28: [2, 40], 29: [2, 40], 30: [2, 40], 33: [2, 40], 34: [1, 57], 36: [2, 40]},
			{33: [1, 58]},
			{
				14: [2, 13],
				15: [2, 13],
				16: [2, 13],
				19: [2, 13],
				20: [2, 13],
				22: [2, 13],
				23: [2, 13],
				24: [2, 13]
			},
			{
				5: [2, 16],
				14: [2, 16],
				15: [2, 16],
				16: [2, 16],
				19: [2, 16],
				20: [2, 16],
				22: [2, 16],
				23: [2, 16],
				24: [2, 16]
			},
			{
				5: [2, 17],
				14: [2, 17],
				15: [2, 17],
				16: [2, 17],
				19: [2, 17],
				20: [2, 17],
				22: [2, 17],
				23: [2, 17],
				24: [2, 17]
			},
			{
				5: [2, 18],
				14: [2, 18],
				15: [2, 18],
				16: [2, 18],
				19: [2, 18],
				20: [2, 18],
				22: [2, 18],
				23: [2, 18],
				24: [2, 18]
			},
			{18: [1, 59]},
			{18: [1, 60]},
			{18: [2, 21]},
			{18: [2, 25], 28: [2, 25], 29: [2, 25], 30: [2, 25], 33: [2, 25]},
			{18: [2, 32], 33: [2, 32]},
			{34: [1, 57]},
			{21: 61, 28: [1, 62], 29: [1, 63], 30: [1, 64], 33: [1, 25], 35: 24},
			{18: [2, 39], 28: [2, 39], 29: [2, 39], 30: [2, 39], 33: [2, 39], 36: [2, 39]},
			{
				5: [2, 19],
				14: [2, 19],
				15: [2, 19],
				16: [2, 19],
				19: [2, 19],
				20: [2, 19],
				22: [2, 19],
				23: [2, 19],
				24: [2, 19]
			},
			{
				5: [2, 15],
				14: [2, 15],
				15: [2, 15],
				16: [2, 15],
				19: [2, 15],
				20: [2, 15],
				22: [2, 15],
				23: [2, 15],
				24: [2, 15]
			},
			{18: [2, 34], 33: [2, 34]},
			{18: [2, 35], 33: [2, 35]},
			{18: [2, 36], 33: [2, 36]},
			{18: [2, 37], 33: [2, 37]}
		],
		defaultSteps: {16: [2, 1], 37: [2, 23], 53: [2, 21]},
		reportParseError: function reportParseError(errorMsg, errorHash) {
			throw new Error(errorMsg);
		},
		processInput: function processInput(sourceInput) {
			var processorInstance = this,
				stateStack = [0],
				valueStack = [null],
				locationStack = [],
				transitionTable = this.transitionTable,
				currentLexeme = "",
				currentLine = 0,
				lexemeLength = 0,
				recoveryCount = 0,
				TOKEN_ERROR = 2,
				END_MARKER = 1;
			this.tokenScanner.setSource(sourceInput);
			this.tokenScanner.yystateInfo = this.yystateInfo;
			this.yystateInfo.tokenScanner = this.tokenScanner;
			if ( typeof this.tokenScanner.locationTracker == "undefined" )
				this.tokenScanner.locationTracker = {};
			var lexemeLocation = this.tokenScanner.locationTracker;
			locationStack.push(lexemeLocation);
			if ( typeof this.yystateInfo.reportParseError === "function" )
				this.reportParseError = this.yystateInfo.reportParseError;

			function popGrammarStack(count) {
				stateStack.length = stateStack.length - 2 * count;
				valueStack.length = valueStack.length - count;
				locationStack.length = locationStack.length - count;
			}

			function fetchToken() {
				var parsedToken;
				parsedToken = processorInstance.tokenScanner.getNextToken() || 1;
				if ( typeof parsedToken !== "number" ) {
					parsedToken = processorInstance.symbolMap[parsedToken] || parsedToken;
				}
				return parsedToken;
			}

			var currentSymbol, prevErrorSymbol, currentState, currentAction, tempA, tempR, resultValue = {}, prop, ruleLength, nextState, anticipatedTokens;
			while (true) {
				currentState = stateStack[stateStack.length - 1];
				if ( this.defaultSteps[currentState] ) {
					currentAction = this.defaultSteps[currentState];
				} else {
					if ( currentSymbol == null )
						currentSymbol = fetchToken();
					currentAction = transitionTable[currentState] && transitionTable[currentState][currentSymbol];
				}
				if ( typeof currentAction === "undefined" || !currentAction.length || !currentAction[0] ) {
					if ( !recoveryCount ) {
						anticipatedTokens = [];
						for ( prop in transitionTable[currentState] )
							if ( this.terminalMap[prop] && prop > 2 ) {
								anticipatedTokens.push("'" + this.terminalMap[prop] + "'");
							}
						var errorString = "";
						if ( this.tokenScanner.showCurrentPosition ) {
							errorString = "Parse error on line " + (currentLine + 1) + ":\n" + this.tokenScanner.showCurrentPosition() + "\nExpecting " + anticipatedTokens.join(", ") + ", got '" + this.terminalMap[currentSymbol] + "'";
						} else {
							errorString = "Parse error on line " + (currentLine + 1) + ": Unexpected " + (currentSymbol == 1 ? "end of input" : "'" + (this.terminalMap[currentSymbol] || currentSymbol) + "'");
						}
						this.reportParseError(errorString, {
							text: this.tokenScanner.currentMatch,
							token: this.terminalMap[currentSymbol] || currentSymbol,
							line: this.tokenScanner.lineIndex,
							loc: lexemeLocation,
							expected: anticipatedTokens
						});
					}
				}
				if ( currentAction[0] instanceof Array && currentAction.length > 1 ) {
					throw new Error("Syntax Error: multiple actions possible at state: " + currentState + ", token: " + currentSymbol);
				}
				switch (currentAction[0]) {
					case 1:
						stateStack.push(currentSymbol);
						valueStack.push(this.tokenScanner.tokenText);
						locationStack.push(this.tokenScanner.locationTracker);
						stateStack.push(currentAction[1]);
						currentSymbol = null;
						if ( !prevErrorSymbol ) {
							lexemeLength = this.tokenScanner.tokenLength;
							currentLexeme = this.tokenScanner.tokenText;
							currentLine = this.tokenScanner.lineIndex;
							lexemeLocation = this.tokenScanner.locationTracker;
							if ( recoveryCount > 0 )
								recoveryCount--;
						} else {
							currentSymbol = prevErrorSymbol;
							prevErrorSymbol = null;
						}
						break;
					case 2:
						ruleLength = this.ruleSet[currentAction[1]][1];
						resultValue.$ = valueStack[valueStack.length - ruleLength];
						resultValue._$ = {
							startLine: locationStack[locationStack.length - (ruleLength || 1)].first_line,
							endLine: locationStack[locationStack.length - 1].last_line,
							startColumn: locationStack[locationStack.length - (ruleLength || 1)].first_column,
							endColumn: locationStack[locationStack.length - 1].last_column
						};
						tempR = this.executeRule.call(resultValue, currentLexeme, lexemeLength, currentLine, this.yystateInfo, currentAction[1], valueStack, locationStack);
						if ( typeof tempR !== "undefined" ) {
							return tempR;
						}
						if ( ruleLength ) {
							stateStack = stateStack.slice(0, -1 * ruleLength * 2);
							valueStack = valueStack.slice(0, -1 * ruleLength);
							locationStack = locationStack.slice(0, -1 * ruleLength);
						}
						stateStack.push(this.ruleSet[currentAction[1]][0]);
						valueStack.push(resultValue.$);
						locationStack.push(resultValue._$);
						nextState = transitionTable[stateStack[stateStack.length - 2]][stateStack[stateStack.length - 1]];
						stateStack.push(nextState);
						break;
					case 3:
						return true;
				}
			}
			return true;
		}
	};
	/* Jison-driven lexical analyzer */
	var tokenStream = ( function() {

		var lexer = ({
			EOF: 1,
			reportLexError: function reportLexError(errorMsg, errorHash) {
				if ( this.yystateInfo.reportParseError ) {
					this.yystateInfo.reportParseError(errorMsg, errorHash);
				} else {
					throw new Error(errorMsg);
				}
			},
			setSource: function(sourceInput) {
				this.sourceText = sourceInput;
				this.moreTokens = this.lessTokens = this.isFinished = false;
				this.lineIndex = this.tokenLength = 0;
				this.tokenText = this.accumulatedText = this.currentMatch = '';
				this.modeStack = ['INITIAL'];
				this.locationTracker = {
					first_line: 1,
					first_column: 0,
					last_line: 1,
					last_column: 0
				};
				return this;
			},
			consumeChar: function() {
				var character = this.sourceText[0];
				this.tokenText += character;
				this.tokenLength++;
				this.currentMatch += character;
				this.accumulatedText += character;
				var newLineMatches = character.match(/\n/);
				if ( newLineMatches ) this.lineIndex++;
				this.sourceText = this.sourceText.slice(1);
				return character;
			},
			unconsumeChar: function(character) {
				this.sourceText = character + this.sourceText;
				return this;
			},
			requestMore: function() {
				this.moreTokens = true;
				return this;
			},
			getPastText: function() {
				var previousText = this.accumulatedText.substring(0, this.accumulatedText.length - this.currentMatch.length);
				return (previousText.length > 20 ? '...' : '') + previousText.substring(-20).replace(/\n/g, "");
			},
			getUpcomingText: function() {
				var nextText = this.currentMatch;
				if ( nextText.length < 20 ) {
					nextText += this.sourceText.substring(0, 20 - nextText.length);
				}
				return (nextText.substring(0, 20) + (nextText.length > 20 ? '...' : '')).replace(/\n/g, "");
			},
			showCurrentPosition: function() {
				var previousText = this.getPastText();
				var caretLine = new Array(previousText.length + 1).join("-");
				return previousText + this.getUpcomingText() + "\n" + caretLine + "^";
			},
			getNextToken: function() {
				if ( this.isFinished ) {
					return this.EOF;
				}
				if ( !this.sourceText ) this.isFinished = true;

				var parsedToken,
					currentMatch,
					columnNum,
					newLineMatches;
				if ( !this.moreTokens ) {
					this.tokenText = '';
					this.currentMatch = '';
				}
				var activeRules = this.getRulesForCurrentState();
				for ( var ruleIdx = 0; ruleIdx < activeRules.length; ruleIdx++ ) {
					currentMatch = this.sourceText.match(this.regexRules[activeRules[ruleIdx]]);
					if ( currentMatch ) {
						newLineMatches = currentMatch[0].match(/\n.*/g);
						if ( newLineMatches ) this.lineIndex += newLineMatches.length;
						this.locationTracker = {
							first_line: this.locationTracker.last_line,
							last_line: this.lineIndex + 1,
							first_column: this.locationTracker.last_column,
							last_column: newLineMatches ? newLineMatches[newLineMatches.length - 1].length - 1 : this.locationTracker.last_column + currentMatch[0].length
						}
						this.tokenText += currentMatch[0];
						this.currentMatch += currentMatch[0];
						this.matches = currentMatch;
						this.tokenLength = this.tokenText.length;
						this.moreTokens = false;
						this.sourceText = this.sourceText.slice(currentMatch[0].length);
						this.accumulatedText += currentMatch[0];
						parsedToken = this.executeLexRule.call(this, this.yystateInfo, this, activeRules[ruleIdx], this.modeStack[this.modeStack.length - 1]);
						if ( parsedToken ) return parsedToken;
						else return;
					}
				}
				if ( this.sourceText === "" ) {
					return this.EOF;
				} else {
					this.reportLexError('Lexical error on line ' + (this.lineIndex + 1) + '. Unrecognized text.\n' + this.showCurrentPosition(),
						{text: "", token: null, line: this.lineIndex});
				}
			},
			lex: function lex() {
				var tokenResult = this.getNextToken();
				if ( typeof tokenResult !== 'undefined' ) {
					return tokenResult;
				} else {
					return this.lex();
				}
			},
			startState: function startState(condition) {
				this.modeStack.push(condition);
			},
			exitState: function exitState() {
				return this.modeStack.pop();
			},
			getRulesForCurrentState: function getRulesForCurrentState() {
				return this.lexConditions[this.modeStack[this.modeStack.length - 1]].rules;
			},
			peekState: function() {
				return this.modeStack[this.modeStack.length - 2];
			},
			enterState: function startState(condition) {
				this.startState(condition);
			}
		});
		lexer.executeLexRule = function anonymous(stateData, lexerData, ruleNumber, CURRENT_LEX_STATE) {

			switch (ruleNumber) {
				case 0:
					if ( lexerData.tokenText.slice(-1) !== "\\" ) this.startState("mode_markup");
					if ( lexerData.tokenText.slice(-1) === "\\" ) lexerData.tokenText = lexerData.tokenText.substring(0, lexerData.tokenLength - 1), this.startState("mode_escaped_markup");
					if ( lexerData.tokenText ) return 14;

					break;
				case 1:
					return 14;
					break;
				case 2:
					this.exitState();
					return 14;
					break;
				case 3:
					return 24;
					break;
				case 4:
					return 16;
					break;
				case 5:
					return 20;
					break;
				case 6:
					return 19;
					break;
				case 7:
					return 19;
					break;
				case 8:
					return 23;
					break;
				case 9:
					return 23;
					break;
				case 10:
					lexerData.tokenText = lexerData.tokenText.substring(3, lexerData.tokenLength - 5);
					this.exitState();
					return 15;
					break;
				case 11:
					return 22;
					break;
				case 12:
					return 34;
					break;
				case 13:
					return 33;
					break;
				case 14:
					return 33;
					break;
				case 15:
					return 36;
					break;
				case 16: /* omit whitespace */
					break;
				case 17:
					this.exitState();
					return 18;
					break;
				case 18:
					this.exitState();
					return 18;
					break;
				case 19:
					lexerData.tokenText = lexerData.tokenText.substring(1, lexerData.tokenLength - 2).replace(/\\"/g, '"');
					return 28;
					break;
				case 20:
					return 30;
					break;
				case 21:
					return 30;
					break;
				case 22:
					return 29;
					break;
				case 23:
					return 33;
					break;
				case 24:
					lexerData.tokenText = lexerData.tokenText.substring(1, lexerData.tokenLength - 2);
					return 33;
					break;
				case 25:
					return 'INVALID_TOKEN';
					break;
				case 26:
					return 5;
					break;
			}
		};
		lexer.regexRules = [/^[^\x00]*?(?=(\{\{))/, /^[^\x00]+/, /^[^\x00]{2,}?(?=(\{\{))/, /^\{\{>/, /^\{\{#/, /^\{\{\//, /^\{\{\^/, /^\{\{\s*else\b/, /^\{\{\{/, /^\{\{&/, /^\{\{![\s\S]*?\}\}/, /^\{\{/, /^=/, /^\.(?=[} ])/, /^\.\./, /^[\/.]/, /^\s+/, /^\}\}\}/, /^\}\}/, /^"(\\["]|[^"])*"/, /^true(?=[}\s])/, /^false(?=[}\s])/, /^[0-9]+(?=[}\s])/, /^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/, /^\[[^\]]*\]/, /^./, /^$/];
		lexer.lexConditions = {
			"mode_markup": {
				"rules": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
				"inclusive": false
			},
			"mode_escaped_markup": {
				"rules": [2],
				"inclusive": false
			},
			"INITIAL": {
				"rules": [0, 1, 26],
				"inclusive": true
			}
		};
		return lexer;
	})()
	syntaxAnalyzer.tokenScanner = tokenStream;
	return syntaxAnalyzer;
})();
if ( typeof require !== 'undefined' && typeof exports !== 'undefined' ) {
	exports.parser = templateGrammar;
	exports.parse = function() {
		return templateGrammar.processInput.apply(templateGrammar, arguments);
	}
	exports.runModuleEntry = function runModuleEntry(invocationArgs) {
		if ( !invocationArgs[1] )
			throw new Error('Usage: ' + invocationArgs[0] + ' FILE_PATH');
		if ( typeof process !== 'undefined' ) {
			var fileContent = require('fs').readFileSync(require('path').join(process.cwd(), invocationArgs[1]), "utf8");
		} else {
			var currentDir = require("file").path(require("file").cwd());
			var fileContent = currentDir.join(invocationArgs[1]).read({charset: "utf-8"});
		}
		return exports.parser.processInput(fileContent);
	}
	if ( typeof module !== 'undefined' && require.main === module ) {
		exports.runModuleEntry(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
	}
};