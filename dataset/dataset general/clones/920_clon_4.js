(function(outputContainer) {
    "use strict";

    // --- Utility Functions ---

    // Replaces the original 'trim' function
    function cleanWhitespace(inputStr) {
        if (typeof inputStr === 'string') {
            return inputStr.replace(/^\s+|\s+$/g, '');
        }
        return inputStr;
    }

    // Replaces the original 'protect_split' function
    // Splits a string by a delimiter, but ignores delimiters found within quotes or parentheses.
    // Delimiters found within protected regions are temporarily replaced with a unique marker,
    // then restored after the split.
    function splitPreservingContext(delimiterChar, sourceString) {
        let processingBuffer = "";
        let currentQuote = null; // Stores the type of quote currently active (', ", `)
        let parenDepth = 0;
        const temporaryDelimiterPlaceholder = "@@@CONTEXT_DELIM_PLACEHOLDER@@@"; // Unique placeholder

        for (let i = 0; i < sourceString.length; i++) {
            const char = sourceString[i];

            if (currentQuote) {
                processingBuffer += char;
                if (char === currentQuote) {
                    currentQuote = null;
                }
            } else if (char === '(') {
                processingBuffer += char;
                parenDepth++;
            } else if (char === ')') {
                processingBuffer += char;
                parenDepth--;
            } else if (char === delimiterChar) {
                if (parenDepth > 0) { // If delimiter is inside parentheses
                    processingBuffer += temporaryDelimiterPlaceholder;
                } else { // If delimiter is outside parentheses and not in a string
                    processingBuffer += char;
                }
            } else if (['"', "'", '`'].includes(char)) {
                processingBuffer += char;
                currentQuote = char;
            } else {
                processingBuffer += char;
            }
        }

        // Split by the actual delimiter, then restore the protected delimiters and trim each segment
        return processingBuffer.split(delimiterChar).map(segment =>
            cleanWhitespace(segment.split(temporaryDelimiterPlaceholder).join(delimiterChar))
        );
    }


    // --- Condition Expression Parser (replacement for CondLexer/CondParser) ---
    const expressionEvaluator = (function() {

        // Defined token types for conditions
        const TokenType = {
            WHITESPACE: 'WSP',
            STRING_VAL: 'STR',
            OPEN_GROUP: 'OPG',
            CLOSE_GROUP: 'CLG',
            LOGIC_OP: 'LGC', // AND, OR
            KEYWORD_OP: 'KWO', // IN, IS, NOT, LIKE
            COMPARE_OP: 'CMP', // =, !=, <, >, <=, >=
            IDENTIFIER_WORD: 'IDW', // column names, numbers, etc.
            END_OF_INPUT: 'EOI'
        };

        // Regular expressions for tokenizing condition strings
        const tokenPatterns = [
            { rx: /^\s+/, type: TokenType.WHITESPACE, skip: true },
            { rx: /^("([^"]|\\")*"|'([^']|\\')*'|`([^`]|\\`)*`)/, type: TokenType.STRING_VAL },
            { rx: /^\(/, type: TokenType.OPEN_GROUP },
            { rx: /^\)/, type: TokenType.CLOSE_GROUP },
            { rx: /^(AND|OR)\b/i, type: TokenType.LOGIC_OP },
            { rx: /^(IN|IS|NOT|LIKE)\b/i, type: TokenType.KEYWORD_OP },
            { rx: /^[!=<>]=?/, type: TokenType.COMPARE_OP },
            { rx: /^(\w+\.?)+/, type: TokenType.IDENTIFIER_WORD } // Handles 'table.column', '123', 'someWord'
        ];

        // Function to convert an input string into a sequence of tokens
        function generateTokens(inputString) {
            let remainingText = inputString;
            const generatedTokens = [];

            while (remainingText.length > 0) {
                let matched = false;
                for (const patternDef of tokenPatterns) {
                    const match = remainingText.match(patternDef.rx);
                    if (match) {
                        if (!patternDef.skip) {
                            generatedTokens.push({ kind: patternDef.type, lexeme: match[0] });
                        }
                        remainingText = remainingText.substring(match[0].length);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    throw new Error(`Syntax Error: Unrecognized token at '${remainingText.substring(0, 20)}...'`);
                }
            }
            generatedTokens.push({ kind: TokenType.END_OF_INPUT, lexeme: '' }); // Sentinel token for end of stream
            return generatedTokens;
        }

        // Helper class to manage the token stream during parsing
        class TokenStreamManager {
            constructor(tokenSequence) {
                this.sequence = tokenSequence;
                this.position = 0;
            }

            // Look at the next token without consuming it
            peek(offset = 0) {
                if (this.position + offset >= this.sequence.length) {
                    return { kind: TokenType.END_OF_INPUT, lexeme: '' };
                }
                return this.sequence[this.position + offset];
            }

            // Consume and return the next token
            advance() {
                if (this.position < this.sequence.length) {
                    return this.sequence[this.position++];
                }
                return { kind: TokenType.END_OF_INPUT, lexeme: '' };
            }

            // Consume token and validate its type and optionally its value
            expect(expectedType, expectedLexeme = null) {
                const current = this.advance();
                if (current.kind !== expectedType || (expectedLexeme && current.lexeme.toUpperCase() !== expectedLexeme.toUpperCase())) {
                    throw new Error(`Syntax Error: Expected ${expectedType}${expectedLexeme ? ` ('${expectedLexeme}')` : ''}, received ${current.kind} ('${current.lexeme}')`);
                }
                return current;
            }
        }

        // Recursive descent parsing functions

        // Top-level function for parsing a condition expression
        function parseConditionExpression(manager) {
            return parseLogicalOperator(manager);
        }

        // Handles logical operators (AND, OR) with lowest precedence
        function parseLogicalOperator(manager) {
            let leftNode = parseComparisonOperator(manager);

            while (manager.peek().kind === TokenType.LOGIC_OP) {
                const operatorToken = manager.advance();
                const rightNode = parseComparisonOperator(manager);
                leftNode = {
                    type: 'binary_expression',
                    operator: operatorToken.lexeme.toUpperCase(),
                    left: leftNode,
                    right: rightNode
                };
            }
            return leftNode;
        }

        // Handles comparison and keyword operators (=, !=, <, >, <=, >=, IN, IS, NOT, LIKE)
        function parseComparisonOperator(manager) {
            let leftNode = parseUnaryOperator(manager);

            while (manager.peek().kind === TokenType.COMPARE_OP || manager.peek().kind === TokenType.KEYWORD_OP) {
                const operatorToken = manager.advance();
                let rightNode;

                if (operatorToken.lexeme.toUpperCase() === 'IN') {
                    manager.expect(TokenType.OPEN_GROUP, '(');
                    const values = [];
                    while (manager.peek().kind !== TokenType.CLOSE_GROUP && manager.peek().kind !== TokenType.END_OF_INPUT) {
                        values.push(parsePrimaryExpression(manager));
                        if (manager.peek().lexeme === ',') { // Allow comma-separated values
                            manager.advance();
                        }
                    }
                    manager.expect(TokenType.CLOSE_GROUP, ')');
                    rightNode = { type: 'list_of_values', values: values };
                } else {
                    rightNode = parseUnaryOperator(manager);
                }

                leftNode = {
                    type: 'binary_expression',
                    operator: operatorToken.lexeme.toUpperCase(),
                    left: leftNode,
                    right: rightNode
                };
            }
            return leftNode;
        }

        // Handles unary operators (NOT)
        function parseUnaryOperator(manager) {
            if (manager.peek().lexeme.toUpperCase() === 'NOT') {
                const operatorToken = manager.advance();
                const operand = parseUnaryOperator(manager); // Unary operators can be chained (e.g., NOT NOT x)
                return {
                    type: 'unary_expression',
                    operator: operatorToken.lexeme.toUpperCase(),
                    operand: operand
                };
            }
            return parsePrimaryExpression(manager);
        }

        // Handles basic expressions: identifiers, string literals, parenthesized expressions
        function parsePrimaryExpression(manager) {
            const token = manager.peek();

            if (token.kind === TokenType.OPEN_GROUP) {
                manager.advance(); // Consume '('
                const expression = parseConditionExpression(manager);
                manager.expect(TokenType.CLOSE_GROUP, ')'); // Consume ')'
                return expression;
            } else if (token.kind === TokenType.IDENTIFIER_WORD) {
                return { type: 'identifier', value: manager.advance().lexeme };
            } else if (token.kind === TokenType.STRING_VAL) {
                return { type: 'literal', value: manager.advance().lexeme };
            } else {
                throw new Error(`Syntax Error: Unexpected token '${token.lexeme}' of type ${token.kind}`);
            }
        }

        return {
            // Main entry point for parsing condition strings
            processConditionText: function(conditionString) {
                if (!conditionString) return null;
                const tokens = generateTokens(conditionString);
                const manager = new TokenStreamManager(tokens);
                const ast = parseConditionExpression(manager);
                if (manager.peek().kind !== TokenType.END_OF_INPUT) {
                    throw new Error(`Syntax Error: Unparsed tokens remaining after expression: '${manager.peek().lexeme}'`);
                }
                return ast;
            }
        };
    })();


    // --- Main SQL Query Structure Parser (replacement for sql2ast) ---
    outputContainer.queryStructureExtractor = function(commandText, shouldParseExpressions = true) {
        if (typeof shouldParseExpressions === 'undefined' || shouldParseExpressions === null) {
            shouldParseExpressions = true;
        }

        // Step 1: Initial cleanup and query isolation (replacement for semi-colon handling)
        const semicolonGuard = "###SEMICOLON_ESC###";
        let workingCommand = commandText.replace(/([("'`].*?;.*[)"'`])/g, function(match) {
            return match.replace(/;/g, semicolonGuard);
        });
        const endOfQueryMarker = "###QUERY_END###";
        workingCommand = workingCommand.replace(/;/g, endOfQueryMarker);
        workingCommand = workingCommand.split(endOfQueryMarker)[0]; // Take only the first statement
        workingCommand = workingCommand.replace(new RegExp(semicolonGuard, 'g'), ';');
        workingCommand = cleanWhitespace(workingCommand);


        // Step 2 & 3: Tokenization based on keywords and content, respecting quotes/parens.
        // This process identifies top-level SQL keywords and the content associated with them.
        const sqlKeywords = [
            'SELECT', 'FROM', 'DELETE FROM', 'INSERT INTO', 'UPDATE',
            'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
            'ORDER BY', 'GROUP BY', 'HAVING', 'WHERE', 'LIMIT', 'VALUES', 'SET'
        ].sort((a, b) => b.length - a.length); // Sort by length descending to match longer keywords first

        const structureTokens = []; // Stores objects like { type: 'KEYWORD'|'CONTENT', value: string }

        let currentPosition = 0;
        let inCurrentQuote = null; // Null, or the quote character (', ", `)
        let currentParenDepth = 0;
        let segmentStart = 0;

        while (currentPosition < workingCommand.length) {
            const remainingCommand = workingCommand.substring(currentPosition);
            let matchedKeyword = null;

            if (inCurrentQuote) {
                // If inside a string, just advance until the end of the string
                if (workingCommand[currentPosition] === inCurrentQuote) {
                    inCurrentQuote = null;
                }
                currentPosition++;
            } else if (workingCommand[currentPosition] === '(') {
                currentParenDepth++;
                currentPosition++;
            } else if (workingCommand[currentPosition] === ')') {
                currentParenDepth--;
                currentPosition++;
            } else if (['"', "'", '`'].includes(workingCommand[currentPosition])) {
                inCurrentQuote = workingCommand[currentPosition];
                currentPosition++;
            } else if (currentParenDepth === 0) { // Only look for keywords at the top-level
                for (const keyword of sqlKeywords) {
                    if (remainingCommand.toUpperCase().startsWith(keyword) &&
                        (remainingCommand.length === keyword.length ||
                         /\s|\(/.test(remainingCommand[keyword.length]))) // Ensure whole word or followed by paren
                    {
                        matchedKeyword = keyword;
                        break;
                    }
                }

                if (matchedKeyword) {
                    // Extract content before this keyword (if any)
                    const contentBefore = cleanWhitespace(workingCommand.substring(segmentStart, currentPosition));
                    if (contentBefore) {
                        structureTokens.push({ type: 'CONTENT', value: contentBefore });
                    }

                    // Add the keyword itself
                    structureTokens.push({ type: 'KEYWORD', value: matchedKeyword.toUpperCase() });
                    currentPosition += matchedKeyword.length;
                    segmentStart = currentPosition; // Start new content segment after keyword
                    continue; // Continue to next iteration to process content after keyword
                }
                currentPosition++;
            } else { // Inside parentheses, but not a string or keyword
                currentPosition++;
            }
        }

        // Add any remaining content after the last keyword
        const finalContent = cleanWhitespace(workingCommand.substring(segmentStart, currentPosition));
        if (finalContent) {
            structureTokens.push({ type: 'CONTENT', value: finalContent });
        }

        // Reconstruct the clause map from the identified tokens
        const clauseMap = {};
        let currentClauseType = null;
        for (let i = 0; i < structureTokens.length; i++) {
            const token = structureTokens[i];

            if (token.type === 'KEYWORD') {
                currentClauseType = token.value;
                // Initialize as array if multiple occurrences are possible (e.g., JOIN)
                if (['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN'].includes(currentClauseType)) {
                     if (!clauseMap[currentClauseType]) clauseMap[currentClauseType] = [];
                }
            } else if (token.type === 'CONTENT' && currentClauseType) {
                // Assign content to the current clause
                if (Array.isArray(clauseMap[currentClauseType])) {
                    clauseMap[currentClauseType].push(token.value);
                } else {
                    clauseMap[currentClauseType] = token.value;
                }
                currentClauseType = null; // Content consumed, reset for next keyword
            }
        }


        // Step 4: Clause-specific parsing (replacement for original analysis functions)
        const parsedStructure = {};

        // SELECT Clause Processor
        function processSelectFields(contentStr) {
            return splitPreservingContext(',', contentStr)
                .filter(item => item !== '')
                .map(item => ({ designation: item }));
        }
        if (clauseMap['SELECT']) {
            parsedStructure['SELECT_FIELDS'] = processSelectFields(clauseMap['SELECT']);
        }

        // SET Clause Processor (for UPDATE statements)
        function processAssignmentFields(contentStr) {
            return splitPreservingContext(',', contentStr)
                .filter(item => item !== '')
                .map(item => ({ assignment: item }));
        }
        if (clauseMap['SET']) {
            parsedStructure['ASSIGNMENTS'] = processAssignmentFields(clauseMap['SET']);
        }

        // FROM/UPDATE/DELETE FROM Clause Processor
        function processSourceTables(contentStr) {
            return contentStr.split(',').map(item => {
                const parts = cleanWhitespace(item).split(/\s+AS\s+/i);
                let alias = parts[1] || '';
                if (alias.startsWith('"') && alias.endsWith('"')) { // Remove quotes around alias
                    alias = alias.substring(1, alias.length - 1);
                }
                return { baseTable: parts[0], aliasName: alias };
            }).filter(item => item.baseTable !== '');
        }
        if (clauseMap['FROM']) {
            parsedStructure['SOURCE_TABLES'] = processSourceTables(clauseMap['FROM']);
        } else if (clauseMap['UPDATE']) {
            parsedStructure['UPDATE_TARGET'] = processSourceTables(clauseMap['UPDATE']);
        } else if (clauseMap['DELETE FROM']) {
            parsedStructure['DELETE_TARGET'] = processSourceTables(clauseMap['DELETE FROM']);
        }

        // JOIN Clauses Processor
        function processJoinSpecifications(joinContent) {
            const parts = joinContent.split(/\s+ON\s+/i);
            const tableParts = cleanWhitespace(parts[0]).split(/\s+AS\s+/i);
            let joinTable = cleanWhitespace(tableParts[0]);
            let joinAlias = cleanWhitespace(tableParts[1] || '');
            let joinCondition = cleanWhitespace(parts[1] || '');

            return {
                joinedTable: joinTable,
                tableAlias: joinAlias,
                joinCriterion: joinCondition
            };
        }
        const allJoins = [];
        ['JOIN', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN'].forEach(joinType => {
            if (clauseMap[joinType]) {
                const contents = Array.isArray(clauseMap[joinType]) ? clauseMap[joinType] : [clauseMap[joinType]];
                contents.forEach(content => {
                    const spec = processJoinSpecifications(content);
                    spec.joinKind = joinType.replace(' JOIN', '').toLowerCase() || 'inner'; // 'JOIN' becomes 'inner'
                    allJoins.push(spec);
                });
            }
        });
        if (allJoins.length > 0) {
            parsedStructure['JOIN_CLAUSES'] = allJoins;
        }

        // WHERE Clause Processor
        if (clauseMap['WHERE']) {
            parsedStructure['FILTER_CONDITION'] = cleanWhitespace(clauseMap['WHERE']);
        }

        // ORDER BY Clause Processor
        function processOrderingDirectives(contentStr) {
            return splitPreservingContext(',', contentStr).map(item => {
                const match = item.match(/([A-Za-z0-9_\.]+)\s*(ASC|DESC)?/i);
                if (match) {
                    return {
                        columnIdentifier: cleanWhitespace(match[1]),
                        sortOrder: cleanWhitespace(match[2] || 'ASC').toUpperCase()
                    };
                }
                return null;
            }).filter(Boolean); // Remove null entries
        }
        if (clauseMap['ORDER BY']) {
            parsedStructure['SORT_ORDER'] = processOrderingDirectives(clauseMap['ORDER BY']);
        }

        // GROUP BY Clause Processor
        function processGroupingColumns(contentStr) {
            return splitPreservingContext(',', contentStr).map(item => {
                const match = item.match(/([A-Za-z0-9_\.]+)/i);
                if (match) {
                    return {
                        groupingColumn: cleanWhitespace(match[1])
                    };
                }
                return null;
            }).filter(Boolean);
        }
        if (clauseMap['GROUP BY']) {
            parsedStructure['GROUPING_COLUMNS'] = processGroupingColumns(clauseMap['GROUP BY']);
        }

        // LIMIT Clause Processor
        function processRowLimit(contentStr) {
            const match = contentStr.match(/(?:(\d+)\s*,\s*)?(\d+)/); // Matches "offset, limit" or just "limit"
            if (match) {
                const offset = match[1] ? parseInt(cleanWhitespace(match[1]), 10) : 0;
                const limit = parseInt(cleanWhitespace(match[2]), 10);
                return { rowCount: limit, startingOffset: offset };
            }
            return null;
        }
        if (clauseMap['LIMIT']) {
            parsedStructure['ROW_LIMIT'] = processRowLimit(clauseMap['LIMIT']);
        }

        // INSERT INTO Clause Processor
        function processInsertTarget(contentStr) {
            const match = contentStr.match(/([A-Za-z0-9_\.]+)\s*(?:\(([A-Za-z0-9_\., ]+)\))?/i);
            if (match) {
                const target = { targetTable: cleanWhitespace(match[1]) };
                if (match[2]) { // If columns are specified
                    target.targetColumns = match[3].split(',').map(cleanWhitespace);
                }
                return target;
            }
            return null;
        }
        if (clauseMap['INSERT INTO']) {
            parsedStructure['INSERT_SPEC'] = processInsertTarget(clauseMap['INSERT INTO']);
        }

        // VALUES Clause Processor
        function processValueGroups(contentStr) {
            let normalizedContent = cleanWhitespace(contentStr);
            if (!normalizedContent.startsWith('(')) { // Handle "VALUES(...)" instead of "VALUES (...)"
                normalizedContent = `(${normalizedContent})`;
            }
            const groups = splitPreservingContext(',', normalizedContent);
            return groups.map(group => {
                let inner = cleanWhitespace(group).replace(/^\(|\)$/g, ''); // Remove outer parentheses
                return splitPreservingContext(',', inner); // Split individual values within each group
            });
        }
        if (clauseMap['VALUES']) {
            parsedStructure['INSERT_VALUES'] = processValueGroups(clauseMap['VALUES']);
        }

        // Step 5: Parse conditions if requested
        if (shouldParseExpressions) {
            if (parsedStructure['FILTER_CONDITION']) {
                parsedStructure['FILTER_CONDITION'] = expressionEvaluator.processConditionText(parsedStructure['FILTER_CONDITION']);
            }
            if (parsedStructure['JOIN_CLAUSES']) {
                parsedStructure['JOIN_CLAUSES'].forEach(joinSpec => {
                    joinSpec.joinCriterion = expressionEvaluator.processConditionText(joinSpec.joinCriterion);
                });
            }
        }

        return parsedStructure;
    };

})(typeof exports === 'object' && typeof exports.nodeName !== 'string' ? exports : (window.sqlParser = {}));