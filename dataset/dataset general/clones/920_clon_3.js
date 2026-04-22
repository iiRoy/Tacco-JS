(function(parserFacade) {
	"use strict";

	/**
	 * Removes leading and trailing whitespace from a given string.
	 * If the input is not a string, it is returned as is.
	 * @param {string} inputStr - The string to trim.
	 * @returns {string} The trimmed string or original input.
	 */
	const cleanWhitespace = (inputStr) => {
		if (typeof inputStr === 'string') {
			return inputStr.replace(/^\s+/g, '').replace(/\s+$/g, '');
		}
		return inputStr;
	};

	/**
	 * Divides a string by a specified delimiter, but only if the delimiter is not enclosed within
	 * parentheses or string literals.
	 * @param {string} divider - The character or string to use as a separator.
	 * @param {string} sourceText - The string to be split.
	 * @returns {string[]} An array of strings, split by the contextual divider.
	 */
	const contextualSplit = (divider, sourceText) => {
		const internalMarker = '###_INTERNAL_DIVIDER_###'; // A unique placeholder to temporarily replace protected dividers.

		let inStringLiteral = false;
		let bracketDepth = 0;
		let transformedText = "";

		for (let idx = 0; idx < sourceText.length; idx++) {
			const currentChar = sourceText[idx];

			// Handle string literal boundaries
			if (!inStringLiteral && (currentChar === "'" || currentChar === '"' || currentChar === '`')) {
				inStringLiteral = currentChar;
			} else if (inStringLiteral && currentChar === inStringLiteral) {
				inStringLiteral = false;
			} else if (!inStringLiteral && currentChar === '(') {
				bracketDepth++;
			} else if (!inStringLiteral && currentChar === ')') {
				bracketDepth--;
			}

			// Replace the divider if it's protected (inside brackets or string)
			if (currentChar === divider && (bracketDepth > 0 || inStringLiteral)) {
				transformedText += internalMarker;
			} else {
				transformedText += currentChar;
			}
		}

		// Perform the actual split on the (potentially modified) string
		let segments = transformedText.split(divider);

		// Restore original dividers in the protected segments and trim
		segments = segments.map((segment) => {
			return cleanWhitespace(segment.replace(new RegExp(internalMarker, 'g'), divider));
		}).filter(segment => segment !== ''); // Remove any empty segments that might arise from splitting

		return segments;
	};

	/**
	 * Inserts a '#' character around each character of a string, and at the beginning.
	 * Used to "protect" keywords from regex matching.
	 * E.g., "word" becomes "#w#o#r#d#"
	 * @param {string} originalValue - The string to embed markers into.
	 * @returns {string} The string with markers.
	 */
	const embedMarkers = (originalValue) => {
		let markedResult = '#';
		for (let charIndex = 0; charIndex < originalValue.length; charIndex++) {
			markedResult += originalValue[charIndex] + "#";
		}
		return markedResult;
	};

	/**
	 * Reconstructs a string that was previously modified by `embedMarkers`, removing the '#' characters.
	 * E.g., "#w#o#r#d#" becomes "word"
	 * @param {string} markedValue - The string with markers to strip.
	 * @returns {string} The original string.
	 */
	const stripMarkers = (markedValue) => {
		let restoredString = '';
		// We start from index 1 and increment by 2 to skip the '#' characters
		for (let charIndex = 1; charIndex < markedValue.length; charIndex += 2) {
			restoredString += markedValue[charIndex];
		}
		return restoredString;
	};


	/**
	 * Parses a SQL query string into an Abstract Syntax Tree (AST) object.
	 * @param {string} sqlText - The SQL query string.
	 * @param {boolean} [enableConditionParsing=true] - Whether to parse WHERE/JOIN conditions into a sub-AST.
	 * @returns {object} An object representing the parsed SQL query.
	 */
	parserFacade.queryToAbstractSyntaxTree = function (sqlText, enableConditionParsing) {
		// Default to true if not explicitly provided or null
		enableConditionParsing = enableConditionParsing ?? true;

		// --- Stage 1: Initial Query Pre-processing and Sanitization ---
		const semicolonReplacement = '###SEMICOLON_ESCAPE###';
		const endOfQueryMarker = '###EOQ_MARKER###';

		// Escape semicolons inside quoted strings to prevent premature splitting
		let processedSqlText = sqlText.replace(/[("'`].*;.*[)"'`]/g, (matchedSegment) => {
			return matchedSegment.replace(/;/g, semicolonReplacement);
		});

		// Replace all top-level semicolons with an EOR marker, then take only the first statement
		processedSqlText = processedSqlText.replace(/;/g, endOfQueryMarker);
		processedSqlText = processedSqlText.split(endOfQueryMarker)[0];
		// Restore escaped semicolons
		processedSqlText = processedSqlText.replace(new RegExp(semicolonReplacement, 'g'), ';');

		// --- Stage 2: Keyword Identification and Protection ---
		const sqlKeywords = [
			'SELECT', 'FROM', 'DELETE FROM', 'INSERT INTO', 'UPDATE', 'JOIN', 'LEFT JOIN',
			'RIGHT JOIN', 'INNER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'WHERE', 'LIMIT',
			'VALUES', 'SET'
		];

		// Generate variations of keywords (with space, with opening parenthesis, and lowercase)
		let keywordVariants = [];
		sqlKeywords.forEach(kw => {
			keywordVariants.push(kw + ' ');
			keywordVariants.push(kw + '(');
		});
		// Add lowercase versions
		keywordVariants = keywordVariants.concat(keywordVariants.map(kw => kw.toLowerCase()));

		// Prepare escaped versions for regex matching
		const escapedKeywordVariants = keywordVariants.map(kw => kw.replace('(', '\\('));
		const keywordRegexPattern = new RegExp(escapedKeywordVariants.join('|'), 'gi');

		// Temporarily hide keywords that appear inside quoted strings or parentheses to avoid false positives during splitting.
		// The `embedMarkers` function adds '#' around characters.
		processedSqlText = processedSqlText.replace(/\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi, (fullMatch) => {
			return fullMatch.replace(keywordRegexPattern, embedMarkers);
		});

		// --- Stage 3: Determine Keyword Positions and Order ---
		const statementPartLocations = {}; // Stores { index: 'KEYWORD' }
		const getBaseKeyword = (fullMatch) => fullMatch.replace(/^((\w|\s)+?)\s?\(?$/i, (m, base) => base);

		keywordVariants.forEach((keywordVariant) => {
			let currentScanPosition = 0;
			let foundPosition;

			while ((foundPosition = processedSqlText.indexOf(keywordVariant, currentScanPosition)) !== -1) {
				const baseName = getBaseKeyword(keywordVariant);
				// Store the base keyword at its starting position. Exact position might shift due to `embedMarkers`
				// but the relative order is maintained.
				statementPartLocations[foundPosition] = baseName;
				currentScanPosition = foundPosition + baseName.length;
			}
		});

		// --- Stage 4: Consolidate and Filter Keyword Positions ---
		let orderedStatementParts = Object.keys(statementPartLocations)
			.sort((a, b) => Number(a) - Number(b))
			.map(key => ({
				position: Number(key),
				name: statementPartLocations[key]
			}));

		// Remove overlapping keywords (e.g., "JOIN" might be detected inside "INNER JOIN")
		let lastOccupiedIndex = -1;
		const filteredParts = [];
		for (const part of orderedStatementParts) {
			if (part.position >= lastOccupiedIndex) {
				lastOccupiedIndex = part.position + part.name.length;
				// Standardize 'JOIN' to 'INNER JOIN' if detected alone
				if (part.name.toUpperCase() === 'JOIN') {
					filteredParts.push({ ...part, name: 'INNER JOIN' });
				} else {
					filteredParts.push(part);
				}
			}
		}
		orderedStatementParts = filteredParts;

		// --- Stage 5: Split the Query into Segments and Unhide Keywords ---
		// Generate a regex pattern for all keyword variants, now including the protected versions
		const protectedKeywordRegex = new RegExp(
			escapedKeywordVariants.map(kw => embedMarkers(kw)).join('|'), 'gi'
		);

		// Split the query based on the main keywords.
		const querySegments = processedSqlText.split(keywordRegexPattern);

		// Restore the original content within the segments (undo `embedMarkers`)
		const cleanedSegments = querySegments.map((segment) => {
			return segment.replace(/\((.+?)\)|"(.+?)"|'(.+?)'|`(.+?)`/gi, (match) => {
				return match.replace(protectedKeywordRegex, stripMarkers);
			});
		});

		// --- Stage 6: Define Analysis Functions for Each Statement Type ---
		const statementAnalyzers = new Map();

		statementAnalyzers.set('SELECT', (segmentContent) => {
			const selections = contextualSplit(',', segmentContent);
			return selections.map(item => ({ column: item }));
		});

		statementAnalyzers.set('SET', (segmentContent) => {
			const assignments = contextualSplit(',', segmentContent);
			return assignments.map(item => ({ expression: item }));
		});

		// Common handler for FROM, DELETE FROM, UPDATE
		const parseTableReferences = (segmentContent) => {
			const tableReferences = segmentContent.split(',').map(cleanWhitespace).filter(item => item !== '');
			return tableReferences.map(item => {
				const aliasSplit = item.split(/ AS /i); // Case-insensitive 'AS'
				let tableName = aliasSplit[0];
				let tableAlias = aliasSplit[1] || '';

				// Remove quotes from alias if present
				if (tableAlias.startsWith('"') && tableAlias.endsWith('"')) {
					tableAlias = tableAlias.substring(1, tableAlias.length - 1);
				}
				return { table: tableName, alias: tableAlias };
			});
		};
		statementAnalyzers.set('FROM', parseTableReferences);
		statementAnalyzers.set('DELETE FROM', parseTableReferences);
		statementAnalyzers.set('UPDATE', parseTableReferences);

		// Handler for various JOIN types
		const parseJoinClause = (segmentContent) => {
			const onClauseSplit = segmentContent.split(/ ON /i);
			if (onClauseSplit.length < 2) {
				// Handle cases where ON clause might be missing or malformed
				console.warn(`JOIN clause without explicit ON condition: ${segmentContent}`);
				return null;
			}
			const tableInfo = onClauseSplit[0].split(/ AS /i);
			return {
				targetTable: cleanWhitespace(tableInfo[0]),
				tableAlias: cleanWhitespace(tableInfo[1] || ''),
				joinCondition: cleanWhitespace(onClauseSplit[1])
			};
		};
		statementAnalyzers.set('LEFT JOIN', parseJoinClause);
		statementAnalyzers.set('INNER JOIN', parseJoinClause);
		statementAnalyzers.set('RIGHT JOIN', parseJoinClause);

		statementAnalyzers.set('WHERE', (segmentContent) => cleanWhitespace(segmentContent));

		statementAnalyzers.set('ORDER BY', (segmentContent) => {
			const orderExpressions = segmentContent.split(',').map(cleanWhitespace).filter(Boolean);
			return orderExpressions.map(expr => {
				const orderMatch = expr.match(/([\w\d_.]+)\s*(ASC|DESC)?/i);
				if (orderMatch) {
					return {
						field: cleanWhitespace(orderMatch[1]),
						direction: (orderMatch[2] || 'ASC').toUpperCase()
					};
				}
				return { field: expr, direction: 'ASC' }; // Default if no match
			});
		});

		statementAnalyzers.set('GROUP BY', (segmentContent) => {
			const groupExpressions = segmentContent.split(',').map(cleanWhitespace).filter(Boolean);
			return groupExpressions.map(expr => ({ field: expr }));
		});

		statementAnalyzers.set('LIMIT', (segmentContent) => {
			const limitMatch = segmentContent.match(/(?:(\d+)\s*,\s*)?(\d+)/i);
			if (!limitMatch) return { count: 0, offset: 0 };
			const offset = Number(limitMatch[1] || 0); // Default offset is 0 if not provided
			const count = Number(limitMatch[2]);
			return { count: count, offset: offset };
		});

		statementAnalyzers.set('INSERT INTO', (segmentContent) => {
			const insertMatch = segmentContent.match(/([\w\d_.]+)\s*(?:\(([\w\d_.,\s]+)\))?/i);
			if (!insertMatch) return { table: '', columns: [] };
			const tableName = cleanWhitespace(insertMatch[1]);
			let columns = [];
			if (insertMatch[2]) {
				columns = insertMatch[2].split(',').map(cleanWhitespace);
			}
			return { table: tableName, columns: columns };
		});

		statementAnalyzers.set('VALUES', (segmentContent) => {
			let valueText = cleanWhitespace(segmentContent);
			// Ensure outer parentheses for consistent splitting if missing
			if (!valueText.startsWith('(')) valueText = `(${valueText}`;

			const valueGroups = contextualSplit(',', valueText);
			const parsedValues = valueGroups.map(group => {
				const cleanedGroup = group.replace(/^\(|\)$/g, ''); // Remove outer parentheses for each group
				return contextualSplit(',', cleanedGroup).map(cleanWhitespace);
			});
			return parsedValues;
		});

		// TODO: Implement HAVING clause analysis

		// --- Stage 7: Assemble the Abstract Syntax Tree ---
		const finalAstResult = {};
		let currentSegmentIndex = 0; // Index for `cleanedSegments`

		// The first segment usually contains content before the first keyword (e.g., "SELECT a,b FROM c" -> "SELECT" is first keyword, first segment is " a,b")
		// The original code uses j++ before accessing parts[j], so the first segment is skipped if it's empty or irrelevant.
		// Let's explicitly handle the first segment as part of the first keyword.
		// So, the first keyword (e.g., SELECT) will process cleanedSegments[1] if the query starts directly with SELECT.
		// If query starts with "SELECT col FROM", then keyword is SELECT, segment is " col ".
		// The parts_order has the exact index of the keyword start, so the segment *after* it is the content.
		// So if `parts_order` is [ {pos: 0, name: 'SELECT'} , {pos: 10, name: 'FROM'} ]
		// `querySegments` will be [ '', ' col ', ' tbl ' ]
		// So SELECT will process querySegments[1], FROM will process querySegments[2].
		// This means currentSegmentIndex needs to start from 1.

		for (let i = 0; i < orderedStatementParts.length; i++) {
			const part = orderedStatementParts[i];
			const keyword = part.name.toUpperCase();
			currentSegmentIndex++; // Advance to the segment content *after* the keyword

			if (statementAnalyzers.has(keyword)) {
				const segmentContent = cleanedSegments[currentSegmentIndex];
				if (segmentContent === undefined) {
					console.warn(`No content found for keyword: ${keyword}. Query might be malformed.`);
					continue;
				}
				const analyzedContent = statementAnalyzers.get(keyword)(segmentContent);

				// Handle multiple occurrences of the same keyword (e.g., multiple JOINs)
				if (Reflect.has(finalAstResult, keyword)) {
					// If it's already an array, push; otherwise, convert to array and then push
					if (Array.isArray(finalAstResult[keyword])) {
						finalAstResult[keyword].push(analyzedContent);
					} else {
						finalAstResult[keyword] = [finalAstResult[keyword], analyzedContent];
					}
				} else {
					finalAstResult[keyword] = analyzedContent;
				}
			} else {
				console.info(`No specific analyzer for statement type: "${keyword}". Skipping analysis.`);
			}
		}

		// --- Stage 8: Post-processing: Reorganize Join Clauses ---
		// Consolidate different JOIN types into a single 'JOIN' array, adding a 'type' property.
		const consolidatedJoins = [];

		['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN'].forEach(joinTypeKey => {
			if (Reflect.has(finalAstResult, joinTypeKey)) {
				const joinItems = Array.isArray(finalAstResult[joinTypeKey]) ?
					finalAstResult[joinTypeKey] : [finalAstResult[joinTypeKey]];

				joinItems.forEach(item => {
					if (item) { // Ensure item is not null from parseJoinClause
						consolidatedJoins.push({
							...item,
							joinKind: joinTypeKey.split(' ')[0].toLowerCase() // 'left', 'inner', 'right'
						});
					}
				});
				delete finalAstResult[joinTypeKey]; // Remove individual join type keys
			}
		});

		if (consolidatedJoins.length > 0) {
			finalAstResult['JOINS'] = consolidatedJoins; // Store under a generic 'JOINS' key
		}

		// --- Stage 9: Conditional Sub-Parsing (for WHERE and JOIN conditions) ---
		if (enableConditionParsing) {
			if (typeof finalAstResult['WHERE'] === 'string') {
				try {
					finalAstResult['WHERE'] = ConditionExpressionParser.parse(finalAstResult['WHERE']);
				} catch (e) {
					console.error("Error parsing WHERE condition:", e.message);
					finalAstResult['WHERE_RAW'] = finalAstResult['WHERE']; // Keep raw if parsing fails
				}
			}
			if (Reflect.has(finalAstResult, 'JOINS') && Array.isArray(finalAstResult['JOINS'])) {
				finalAstResult['JOINS'].forEach((joinClause, index) => {
					if (joinClause && typeof joinClause.joinCondition === 'string') {
						try {
							finalAstResult['JOINS'][index].joinCondition = ConditionExpressionParser.parse(joinClause.joinCondition);
						} catch (e) {
							console.error(`Error parsing JOIN condition for join ${index}:`, e.message);
							finalAstResult['JOINS'][index]['joinCondition_RAW'] = joinClause.joinCondition; // Keep raw
						}
					}
				});
			}
		}

		return finalAstResult;
	};


	/*
	 * LEXICAL ANALYZER AND PARSER FOR SQL CONDITIONS (WHERE/ON clauses)
	 * Loosely inspired by principles from compiler design.
	 */

	/**
	 * Creates a new ExpressionLexer instance.
	 * @class
	 * @param {string} expressionInput - The string containing the condition expression.
	 */
	function ExpressionLexer(expressionInput) {
		this.expressionInput = expressionInput;
		this.currentPosition = 0;
		this.characterBuffer = "";

		this.advanceCharacter(); // Initialize the first character
	}

	ExpressionLexer.prototype = {
		constructor: ExpressionLexer,

		/**
		 * Moves the internal cursor to the next character in the input string.
		 * Sets `characterBuffer` to an empty string if end of input is reached.
		 */
		advanceCharacter: function () {
			this.characterBuffer = this.expressionInput[this.currentPosition++] || "";
		},

		/**
		 * Determines and returns the next token from the input stream.
		 * Skips whitespace.
		 * @returns {object} An object with `type` and `value` properties representing the token.
		 */
		getNextToken: function () {
			// Skip any leading whitespace
			while (/\s/.test(this.characterBuffer) && this.characterBuffer !== "") {
				this.advanceCharacter();
			}

			if (this.characterBuffer === "") {
				return { type: 'end_of_stream', value: '' };
			}
			if (/\w/.test(this.characterBuffer)) {
				return this.extractWordToken();
			}
			if (/["'`]/.test(this.characterBuffer)) {
				return this.extractStringLiteral();
			}
			if (/[()]/.test(this.characterBuffer)) {
				return this.extractGroupingSymbol();
			}
			if (/[!=<>]/.test(this.characterBuffer)) {
				return this.extractOperatorToken();
			}

			// If none of the above, it's an unrecognized character. Advance and return an unknown token.
			const unknownChar = this.characterBuffer;
			this.advanceCharacter();
			return { type: 'unknown', value: unknownChar };
		},

		/**
		 * Extracts a word token (e.g., identifiers, numbers, SQL keywords like AND, OR, IN).
		 * Handles words that might contain spaces if they are part of a function call.
		 * @returns {object} The word token.
		 */
		extractWordToken: function () {
			let currentLexeme = "";
			let nestedBracketCount = 0;
			let currentStringDelimiter = false;

			while (this.characterBuffer !== "") {
				// Check for string literal boundaries within a word (e.g., `table`.`column`)
				if (!currentStringDelimiter && (this.characterBuffer === "'" || this.characterBuffer === '"' || this.characterBuffer === '`')) {
					currentStringDelimiter = this.characterBuffer;
				} else if (currentStringDelimiter && this.characterBuffer === currentStringDelimiter) {
					currentStringDelimiter = false;
				} else {
					// Allow spaces and operators inside function calls (e.g., `FUNC(arg1, arg2)`)
					if (!currentStringDelimiter) {
						if (this.characterBuffer === '(') nestedBracketCount++;
						else if (this.characterBuffer === ')') nestedBracketCount--;

						// If we encounter an operator or a closing bracket outside of any function/string, the word token ends.
						if (nestedBracketCount < 0 || /[!=<>]/.test(this.characterBuffer)) break;
					}

					// If we encounter a space outside of a function call or string, the word token ends.
					if (this.characterBuffer === ' ' && nestedBracketCount <= 0 && !currentStringDelimiter) break;
				}

				currentLexeme += this.characterBuffer;
				this.advanceCharacter();
			}

			const normalizedLexeme = currentLexeme.toUpperCase();
			if (normalizedLexeme === 'AND' || normalizedLexeme === 'OR') {
				return { type: 'logical_op', value: currentLexeme };
			}
			if (normalizedLexeme === 'IN' || normalizedLexeme === 'IS' || normalizedLexeme === 'NOT' || normalizedLexeme === 'LIKE') {
				return { type: 'relational_op', value: currentLexeme };
			}
			return { type: 'identifier', value: currentLexeme };
		},

		/**
		 * Extracts a string literal token (e.g., 'value', "value", `value`).
		 * Handles backtick-quoted identifiers that might include dots.
		 * @returns {object} The string literal token.
		 */
		extractStringLiteral: function () {
			let currentLexeme = "";
			const startingQuote = this.characterBuffer;

			currentLexeme += this.characterBuffer;
			this.advanceCharacter(); // Consume the opening quote

			while (this.characterBuffer !== startingQuote && this.characterBuffer !== "") {
				currentLexeme += this.characterBuffer;
				this.advanceCharacter();
			}

			if (this.characterBuffer === "") {
				throw new Error(`Unterminated string literal: ${currentLexeme}`);
			}

			currentLexeme += this.characterBuffer; // Consume the closing quote
			this.advanceCharacter();

			// Handle `table`.`column` style identifiers
			if (this.characterBuffer === '.') {
				currentLexeme += this.characterBuffer;
				this.advanceCharacter();
				// Recursively call to get the next quoted part
				const nextPart = this.extractStringLiteral();
				currentLexeme += nextPart.value;
				return { type: 'identifier', value: currentLexeme }; // Treat as a compound identifier
			}

			return { type: 'string_literal', value: currentLexeme };
		},

		/**
		 * Extracts a grouping symbol token (e.g., '(', ')').
		 * @returns {object} The grouping symbol token.
		 */
		extractGroupingSymbol: function () {
			const symbol = this.characterBuffer;
			this.advanceCharacter();
			return { type: 'grouping_symbol', value: symbol };
		},

		/**
		 * Extracts an operator token (e.g., =, <, >=, !=).
		 * Handles multi-character operators.
		 * @returns {object} The operator token.
		 */
		extractOperatorToken: function () {
			let operator = this.characterBuffer;
			this.advanceCharacter();

			// Check for two-character operators like <=, >=, !=, ==
			if (this.characterBuffer === '=' || (operator === '!' && this.characterBuffer === '=')) {
				operator += this.characterBuffer;
				this.advanceCharacter();
			}
			return { type: 'relational_op', value: operator };
		}
	};

	/**
	 * Creates a new ExpressionSyntaxParser instance.
	 * @class
	 * @param {string} expressionInput - The string containing the condition expression.
	 */
	function ExpressionSyntaxParser(expressionInput) {
		this.tokenStream = new ExpressionLexer(expressionInput);
		this.currentParsedToken = null;

		this.fetchNextMeaningfulToken(); // Initialize the first token
	}

	ExpressionSyntaxParser.prototype = {
		constructor: ExpressionSyntaxParser,

		/**
		 * Advances to the next token, skipping any 'unknown' or 'empty' tokens.
		 * @returns {object} The next meaningful token.
		 */
		fetchNextMeaningfulToken: function () {
			this.currentParsedToken = this.tokenStream.getNextToken();
			// In case the lexer returns 'unknown' for some reason, we might want to skip or handle it.
			// For now, let's assume 'unknown' would be an error, and 'empty' is handled by lexer.
			return this.currentParsedToken;
		},

		/**
		 * Asserts that the current token matches an expected type and/or value.
		 * Consumes the token if it matches. Throws an error if no match.
		 * @param {string} expectedType - The expected token type.
		 * @param {string} [expectedValue] - The optional expected token value.
		 * @returns {object} The matched token.
		 */
		assertTokenMatch: function (expectedType, expectedValue) {
			const token = this.currentParsedToken;
			if (token.type !== expectedType) {
				throw new Error(`Syntax Error: Expected ${expectedType}, but found ${token.type} ('${token.value}')`);
			}
			if (expectedValue && token.value.toUpperCase() !== expectedValue.toUpperCase()) {
				throw new Error(`Syntax Error: Expected '${expectedValue}', but found '${token.value}'`);
			}
			this.fetchNextMeaningfulToken(); // Consume the token
			return token;
		},

		/**
		 * Starts the parsing process for the entire expression.
		 * @returns {object} The root of the AST for the expression.
		 */
		buildAbstractSyntaxTree: function () {
			const ast = this.processLogicalOperators();
			if (this.currentParsedToken.type !== 'end_of_stream') {
				throw new Error(`Syntax Error: Unexpected token '${this.currentParsedToken.value}' at end of expression.`);
			}
			return ast;
		},

		/**
		 * Processes logical operators (AND, OR) to build the expression tree.
		 * Handles operator precedence (AND binds tighter than OR).
		 * @returns {object} A sub-tree representing logical operations.
		 */
		processLogicalOperators: function () {
			let node = this.processRelationalOperators();

			while (this.currentParsedToken.type === 'logical_op') {
				const operatorToken = this.currentParsedToken;
				this.fetchNextMeaningfulToken(); // Consume AND/OR

				const rightNode = this.processRelationalOperators();
				node = {
					type: 'LogicalExpression',
					operator: operatorToken.value.toUpperCase(),
					left: node,
					right: rightNode
				};
			}
			return node;
		},

		/**
		 * Processes relational operators (>, <, =, LIKE, IN, IS).
		 * @returns {object} A sub-tree representing relational operations.
		 */
		processRelationalOperators: function () {
			let node = this.processPrimaryElements();

			while (this.currentParsedToken.type === 'relational_op') {
				const operatorToken = this.currentParsedToken;
				this.fetchNextMeaningfulToken(); // Consume operator

				// Special handling for 'NOT' before other relational ops
				let isNegated = false;
				if (operatorToken.value.toUpperCase() === 'NOT') {
					isNegated = true;
					// Expect another relational operator after NOT (e.g., NOT LIKE, NOT IN)
					this.assertTokenMatch('relational_op'); // Consume the actual operator
					operatorToken.value = this.currentParsedToken.value; // Update operator
					this.fetchNextMeaningfulToken(); // Consume the actual operator
				}

				const rightNode = this.processPrimaryElements();

				node = {
					type: 'RelationalExpression',
					operator: operatorToken.value.toUpperCase(),
					left: node,
					right: rightNode,
					negated: isNegated
				};
			}
			return node;
		},

		/**
		 * Processes primary elements of an expression: identifiers, string literals, and parenthesized expressions.
		 * @returns {object} A sub-tree representing a primary element.
		 */
		processPrimaryElements: function () {
			const token = this.currentParsedToken;

			if (token.type === 'identifier' || token.type === 'string_literal') {
				this.fetchNextMeaningfulToken(); // Consume identifier/literal
				return { type: 'Literal', value: token.value };
			} else if (token.type === 'grouping_symbol' && token.value === '(') {
				this.fetchNextMeaningfulToken(); // Consume '('
				const innerExpression = this.processLogicalOperators(); // Recursively parse inner expression
				this.assertTokenMatch('grouping_symbol', ')'); // Expect and consume ')'
				return innerExpression;
			} else if (token.type === 'end_of_stream') {
				throw new Error('Syntax Error: Unexpected end of expression.');
			} else {
				throw new Error(`Syntax Error: Unexpected token '${token.value}' of type '${token.type}'. Expected identifier, literal, or opening parenthesis.`);
			}
		}
	};

	// Static method for convenience
	ExpressionSyntaxParser.parse = function (expression) {
		const parser = new ExpressionSyntaxParser(expression);
		return parser.buildAbstractSyntaxTree();
	};

	// Expose the ConditionExpressionParser globally or within the module scope
	const ConditionExpressionParser = ExpressionSyntaxParser;

})(typeof exports === 'object' && typeof module === 'object' ? exports : this);