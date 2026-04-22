SyntaxHighlighter.defineMode("oxidized", function() {
    var baseIndentSize = 4, nestedIndentSize = 2; // Default and alternative indentation amounts
    var valueContextWords = { // Keywords recognized in value contexts
        "if": "conditional-flow", "while": "conditional-flow", "else": "alternative-flow",
        "do": "alternative-flow", "ret": "alternative-flow", "fail": "alternative-flow",
        "break": "literal-value", "cont": "literal-value", "const": "binding", "resource": "function-def",
        "let": "binding", "fn": "function-def", "for": "loop-construct", "alt": "match-construct", "obj": "function-def",
        "lambda": "function-def", "type": "type-declaration", "tag": "enum-variant", "mod": "module-scope",
        "as": "operator-symbol", "true": "literal-value", "false": "literal-value", "assert": "operator-symbol", "check": "operator-symbol",
        "claim": "operator-symbol", "native": "ignored-token", "unsafe": "ignored-token", "import": "alternative-flow",
        "export": "alternative-flow", "copy": "operator-symbol", "log": "operator-symbol", "log_err": "operator-symbol"
    };

    var typeContextWords = (function() { // Keywords specific to type contexts
        var wordMap = { "fn": "function-def", "code-block": "function-def", "obj": "object-type" };
        var primitiveTypes = "boolean unsigned_integer integer i_8 i_16 i_32 i_64 u_8 u_16 u_32 u_64 floating_point f_32 f_64 string character".split(" ");
        for (var idx = 0, endIdx = primitiveTypes.length; idx < endIdx; ++idx) {
            wordMap[primitiveTypes[idx]] = "literal-value";
        }
        return wordMap;
    })();

    var symbolPattern = /[+\-*&%=<>!?|\.@]/; // Regular expression for operator characters

    // --- Tokenization Components ---

    // Scratch variables for passing token classification and content between tokenizer functions
    var tokenCategory, tokenContent;

    function classifyToken(tokCat, tokenStyle) {
        tokenCategory = tokCat;
        return tokenStyle;
    }

    function primaryTokenizer(inputFlow, parserState) {
        var currentChar = inputFlow.next();
        if (currentChar == '"') {
            parserState.currentTokenizer = stringTokenizer;
            return parserState.currentTokenizer(inputFlow, parserState);
        }
        if (currentChar == "'") {
            tokenCategory = "literal-value";
            if (inputFlow.eat("\\")) {
                if (inputFlow.skipTo("'")) { inputFlow.next(); return "text-literal"; }
                else { return "syntax-error"; }
            } else {
                inputFlow.next();
                return inputFlow.eat("'") ? "text-literal" : "syntax-error";
            }
        }
        if (currentChar == "/") {
            if (inputFlow.eat("/")) { inputFlow.skipToEnd(); return "code-comment"; }
            if (inputFlow.eat("*")) {
                parserState.currentTokenizer = commentBlockTokenizer(1);
                return parserState.currentTokenizer(inputFlow, parserState);
            }
        }
        if (currentChar == "#") {
            if (inputFlow.eat("[")) { tokenCategory = "attribute-open"; return null; }
            inputFlow.eatWhile(/\w/);
            return classifyToken("macro-call", "meta");
        }
        if (currentChar == ":" && inputFlow.match(":<")) {
            return classifyToken("operator-symbol", null);
        }
        if (currentChar.match(/\d/) || (currentChar == "." && inputFlow.eat(/\d/))) {
            var isFloatingPoint = false;
            if (!inputFlow.match(/^x[\da-f]+/i) && !inputFlow.match(/^b[01]+/)) {
                inputFlow.eatWhile(/\d/);
                if (inputFlow.eat(".")) { isFloatingPoint = true; inputFlow.eatWhile(/\d/); }
                if (inputFlow.match(/^e[+\-]?\d+/i)) { isFloatingPoint = true; }
            }
            if (isFloatingPoint) inputFlow.match(/^f(?:32|64)/);
            else inputFlow.match(/^[ui](?:8|16|32|64)/);
            return classifyToken("literal-value", "numeric-literal");
        }
        if (currentChar.match(/[()\[\]{}:;,]/)) return classifyToken(currentChar, null);
        if (currentChar == "-" && inputFlow.eat(">")) return classifyToken("->", null);
        if (currentChar.match(symbolPattern)) {
            inputFlow.eatWhile(symbolPattern);
            return classifyToken("operator-symbol", null);
        }
        inputFlow.eatWhile(/\w/);
        tokenContent = inputFlow.current();
        if (inputFlow.match(/^::\w/)) {
            inputFlow.backUp(1);
            return classifyToken("path-prefix", "secondary-variable");
        }
        if (parserState.activeKeywords.propertyIsEnumerable(tokenContent))
            return classifyToken(parserState.activeKeywords[tokenContent], "reserved-word");
        return classifyToken("name", "general-variable");
    }

    function stringTokenizer(inputFlow, parserState) {
        var currentChar, isEscaped = false;
        while (currentChar = inputFlow.next()) {
            if (currentChar == '"' && !isEscaped) {
                parserState.currentTokenizer = primaryTokenizer;
                return classifyToken("literal-value", "text-literal");
            }
            isEscaped = !isEscaped && currentChar == "\\";
        }
        // This is a hack to prevent parser confusion when strings are split across lines.
        return classifyToken("operator-symbol", "text-literal");
    }

    function commentBlockTokenizer(commentDepth) {
        return function(inputFlow, parserState) {
            var previousChar = null, currentChar;
            while (currentChar = inputFlow.next()) {
                if (currentChar == "/" && previousChar == "*") {
                    if (commentDepth == 1) {
                        parserState.currentTokenizer = primaryTokenizer;
                        break;
                    } else {
                        parserState.currentTokenizer = commentBlockTokenizer(commentDepth - 1);
                        return parserState.currentTokenizer(inputFlow, parserState);
                    }
                }
                if (currentChar == "*" && previousChar == "/") {
                    parserState.currentTokenizer = commentBlockTokenizer(commentDepth + 1);
                    return parserState.currentTokenizer(inputFlow, parserState);
                }
                previousChar = currentChar;
            }
            return "code-comment";
        };
    }

    // --- Parser Core ---

    var parserContext = {parserState: null, inputFlow: null, markedToken: null, combinatorStack: null};

    function deferCombinators() { // Pushes combinators onto the stack
        for (var idx = arguments.length - 1; idx >= 0; idx--) parserContext.combinatorStack.push(arguments[idx]);
    }

    function continueParsing() { // Defers combinators and returns true to signal progress
        deferCombinators.apply(null, arguments);
        return true;
    }

    function enterScope(scopeType, scopeInfo) { // Pushes a new lexical scope onto the stack
        var lexicalResult = function() {
            var parserState = parserContext.parserState;
            parserState.lexicalScope = {indented: parserState.indented, column: parserContext.inputFlow.column(),
                                       scopeType: scopeType, prev: parserState.lexicalScope, scopeInfo: scopeInfo};
        };
        lexicalResult.lex = true; // Mark this function as a lexical operation
        return lexicalResult;
    }

    function exitScope() { // Pops the current lexical scope from the stack
        var parserState = parserContext.parserState;
        if (parserState.lexicalScope.prev) {
            if (parserState.lexicalScope.scopeType == ")")
                parserState.indented = parserState.lexicalScope.indented;
            parserState.lexicalScope = parserState.lexicalScope.prev;
        }
    }

    function activateTypeGrammar() { parserContext.parserState.activeKeywords = typeContextWords; }
    function activateValueGrammar() { parserContext.parserState.activeKeywords = valueContextWords; }

    exitScope.lex = activateTypeGrammar.lex = activateValueGrammar.lex = true;

    // --- Parser Combinators ---

    function delimitedList(combinatorFunc, terminatorToken) {
        function processMore(tokCat) {
            if (tokCat == ",") return continueParsing(combinatorFunc, processMore);
            if (tokCat == terminatorToken) return continueParsing();
            return continueParsing(processMore);
        }
        return function(tokCat) {
            if (tokCat == terminatorToken) return continueParsing();
            return deferCombinators(combinatorFunc, processMore);
        };
    }

    function codeBlockParser(tokCat) {
        if (tokCat == "}") return continueParsing();
        if (tokCat == "binding") return continueParsing(enterScope("statement-unit", "binding"), declarationDefinition, exitScope, codeBlockParser);
        if (tokCat == "function-def") return continueParsing(enterScope("statement-unit"), functionDefinition, exitScope, codeBlockParser);
        if (tokCat == "type-declaration") return continueParsing(enterScope("statement-unit"), typeDefinition, statementTerminator, exitScope, codeBlockParser);
        if (tokCat == "enum-variant") return continueParsing(enterScope("statement-unit"), enumVariantDefinition, exitScope, codeBlockParser);
        if (tokCat == "module-scope") return continueParsing(enterScope("statement-unit"), moduleDefinition, exitScope, codeBlockParser);
        if (tokCat == "attribute-open") return continueParsing(enterScope("]"), delimitedList(syntaxExpression, "]"), exitScope);
        if (tokCat == "ignored-token") return continueParsing(codeBlockParser);
        return deferCombinators(enterScope("statement-unit"), syntaxExpression, exitScope, statementTerminator, codeBlockParser);
    }

    function statementTerminator(tokCat) {
        if (tokCat == ";") return continueParsing();
        return deferCombinators();
    }

    function syntaxExpression(tokCat) {
        if (tokCat == "literal-value" || tokCat == "name") return continueParsing(optionalOperator);
        if (tokCat == "{") return continueParsing(enterScope("}"), bracedExpression, exitScope);
        if (tokCat.match(/[\[\(]/)) return parseBracketed(tokCat, syntaxExpression);
        if (tokCat.match(/[\]\)\};,]/)) return deferCombinators();
        if (tokCat == "conditional-flow") return continueParsing(syntaxExpression, syntaxExpression);
        if (tokCat == "alternative-flow" || tokCat == "operator-symbol") return continueParsing(syntaxExpression);
        if (tokCat == "loop-construct") return continueParsing(matchPattern, optionalTypeAnnotation, inOperator, syntaxExpression, syntaxExpression);
        if (tokCat == "match-construct") return continueParsing(syntaxExpression, alternativeBody);
        if (tokCat == "function-def") return continueParsing(functionDefinition);
        if (tokCat == "macro-call") return continueParsing(macroInvocation);
        return continueParsing();
    }

    function optionalOperator(tokCat) {
        if (tokenContent == ".") return continueParsing(optionalProperty);
        if (tokenContent == "::<"){ return continueParsing(typeParameters, optionalOperator); }
        if (tokCat == "operator-symbol" || tokenContent == ":") return continueParsing(syntaxExpression);
        if (tokCat == "(" || tokCat == "[") return parseBracketed(tokCat, syntaxExpression);
        return deferCombinators();
    }

    function optionalProperty(tokCat) {
        if (tokenContent.match(/^\w+$/)) {parserContext.markedToken = "general-variable"; return continueParsing(optionalOperator);}
        return deferCombinators(syntaxExpression);
    }

    function bracedExpression(tokCat) {
        if (tokCat == "operator-symbol") {
            if (tokenContent == "|") return continueParsing(blockVariables, exitScope, enterScope("}", "code-block"), codeBlockParser);
            if (tokenContent == "||") return continueParsing(exitScope, enterScope("}", "code-block"), codeBlockParser);
        }
        if (tokenContent == "mutable" || (tokenContent.match(/^\w+$/) && parserContext.inputFlow.peek() == ":"
                                 && !parserContext.inputFlow.match("::", false))) return deferCombinators(recordLiteral);
        return deferCombinators(codeBlockParser);
    }

    function recordLiteral(tokCat) {
        if (tokenContent == "mutable" || tokenContent == "with") {parserContext.markedToken = "reserved-word"; return continueParsing(recordLiteral);}
        if (tokenContent.match(/^\w*$/)) {parserContext.markedToken = "general-variable"; return continueParsing(recordLiteral);}
        if (tokCat == ":") return continueParsing(syntaxExpression, recordLiteral);
        if (tokCat == "}") return continueParsing();
        return continueParsing(recordLiteral);
    }

    function blockVariables(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(blockVariables);}
        if (tokCat == "operator-symbol" && tokenContent == "|") return continueParsing();
        return continueParsing(blockVariables);
    }

    function declarationDefinition(tokCat) {
        if (tokCat == ";") return continueParsing();
        if (tokenContent == "=") return continueParsing(syntaxExpression, declarationDefinition);
        if (tokCat == ",") return continueParsing(declarationDefinition);
        return deferCombinators(matchPattern, optionalTypeAnnotation, declarationDefinition);
    }

    function optionalTypeAnnotation(tokCat) {
        if (tokCat == ":") return continueParsing(activateTypeGrammar, rawTypeParser, activateValueGrammar);
        return deferCombinators();
    }

    function inOperator(tokCat) {
        if (tokCat == "name" && tokenContent == "in") {parserContext.markedToken = "reserved-word"; return continueParsing();}
        return deferCombinators();
    }

    function functionDefinition(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(functionDefinition);}
        if (tokenContent == "<") return continueParsing(typeParameters, functionDefinition);
        if (tokCat == "{") return deferCombinators(syntaxExpression);
        if (tokCat == "(") return continueParsing(enterScope(")"), delimitedList(argumentDefinition, ")"), exitScope, functionDefinition);
        if (tokCat == "->") return continueParsing(activateTypeGrammar, rawTypeParser, activateValueGrammar, functionDefinition);
        return continueParsing(functionDefinition);
    }

    function typeDefinition(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(typeDefinition);}
        if (tokenContent == "<") return continueParsing(typeParameters, typeDefinition);
        if (tokenContent == "=") return continueParsing(activateTypeGrammar, rawTypeParser, activateValueGrammar);
        return continueParsing(typeDefinition);
    }

    function enumVariantDefinition(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(enumVariantDefinition);}
        if (tokenContent == "<") return continueParsing(typeParameters, enumVariantDefinition);
        if (tokenContent == "=") return continueParsing(activateTypeGrammar, rawTypeParser, activateValueGrammar, statementTerminator);
        if (tokCat == "{") return continueParsing(enterScope("}"), activateTypeGrammar, enumVariantBlock, activateValueGrammar, exitScope);
        return continueParsing(enumVariantDefinition);
    }

    function enumVariantBlock(tokCat) {
        if (tokCat == "}") return continueParsing();
        if (tokCat == "(") return continueParsing(enterScope(")"), delimitedList(rawTypeParser, ")"), exitScope, enumVariantBlock);
        if (tokenContent.match(/^\w+$/)) parserContext.markedToken = "definition-name";
        return continueParsing(enumVariantBlock);
    }

    function moduleDefinition(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(moduleDefinition);}
        if (tokCat == "{") return continueParsing(enterScope("}"), codeBlockParser, exitScope);
        return deferCombinators();
    }

    function typeParameters(tokCat) {
        if (tokenContent == ">") return continueParsing();
        if (tokenContent == ",") return continueParsing(typeParameters);
        return deferCombinators(rawTypeParser, typeParameters);
    }

    function argumentDefinition(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(argumentDefinition);}
        if (tokCat == ":") return continueParsing(activateTypeGrammar, rawTypeParser, activateValueGrammar);
        return deferCombinators();
    }

    function rawTypeParser(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "tertiary-variable"; return continueParsing(rawTypeOptionalParameter); }
        if (tokenContent == "mutable") {parserContext.markedToken = "reserved-word"; return continueParsing(rawTypeParser);}
        if (tokCat == "literal-value") return continueParsing(rawTypeOptionalParameter);
        if (tokCat == "operator-symbol" || tokCat == "object-type") return continueParsing(rawTypeParser);
        if (tokCat == "function-def") return continueParsing(functionTypeParser);
        return parseBracketed(tokCat, rawTypeParser);
    }

    function rawTypeOptionalParameter(tokCat) {
        if (tokenContent == "<") return continueParsing(typeParameters);
        return deferCombinators();
    }

    function functionTypeParser(tokCat) {
        if (tokCat == "(") return continueParsing(enterScope("("), delimitedList(rawTypeParser, ")"), exitScope, functionTypeParser);
        if (tokCat == "->") return continueParsing(rawTypeParser);
        return deferCombinators();
    }

    function matchPattern(tokCat) {
        if (tokCat == "name") {parserContext.markedToken = "definition-name"; return continueParsing(matchPatternOptionalOperator);}
        if (tokCat == "literal-value") return continueParsing(matchPatternOptionalOperator);
        if (tokCat == "operator-symbol") return continueParsing(matchPattern);
        return parseBracketed(tokCat, matchPattern);
    }

    function matchPatternOptionalOperator(tokCat) {
        if (tokCat == "operator-symbol" && tokenContent == ".") return continueParsing();
        if (tokenContent == "to") {parserContext.markedToken = "reserved-word"; return continueParsing(matchPattern);}
        else return deferCombinators();
    }

    function alternativeBody(tokCat) {
        if (tokCat == "{") return continueParsing(enterScope("}", "match-construct"), alternativeBlock, exitScope);
        return deferCombinators();
    }

    function alternativeBlock(tokCat) {
        if (tokCat == "}") return continueParsing();
        if (tokCat == "|") return continueParsing(alternativeBlock);
        if (tokenContent == "when") {parserContext.markedToken = "reserved-word"; return continueParsing(syntaxExpression, alternativeBlock);}
        if (tokCat == "{") return continueParsing(enterScope("}", "match-construct"), codeBlockParser, exitScope, alternativeBlock);
        return deferCombinators(matchPattern, alternativeBlock);
    }

    function macroInvocation(tokCat) {
        if (tokCat.match(/[\[\(\{]/)) return parseBracketed(tokCat, syntaxExpression);
        return deferCombinators();
    }

    function parseBracketed(tokCat, combinatorFunc) {
        if (tokCat == "[") return continueParsing(enterScope("]"), delimitedList(combinatorFunc, "]"), exitScope);
        if (tokCat == "(") return continueParsing(enterScope(")"), delimitedList(combinatorFunc, ")"), exitScope);
        if (tokCat == "{") return continueParsing(enterScope("}"), delimitedList(combinatorFunc, "}"), exitScope);
        return continueParsing();
    }

    function executeParser(parserState, inputFlow, tokenStyle) {
        var combinatorStack = parserState.combinatorStack;
        // Share context with combinators (more efficient than many closures)
        parserContext.parserState = parserState; parserContext.inputFlow = inputFlow; parserContext.markedToken = null, parserContext.combinatorStack = combinatorStack;

        while (true) {
            var currentCombinator = combinatorStack.length ? combinatorStack.pop() : codeBlockParser;
            if (currentCombinator(tokenCategory)) {
                // Execute lexical operations after main combinator
                while(combinatorStack.length && combinatorStack[combinatorStack.length - 1].lex)
                    combinatorStack.pop()();
                return parserContext.markedToken || tokenStyle;
            }
        }
    }

    return {
        initialState: function() {
            return {
                currentTokenizer: primaryTokenizer,
                combinatorStack: [],
                lexicalScope: {indented: -baseIndentSize, column: 0, scopeType: "root-scope", align: false},
                activeKeywords: valueContextWords,
                indented: 0
            };
        },

        processToken: function(inputFlow, parserState) {
            if (inputFlow.sol()) { // Start of line
                if (!parserState.lexicalScope.hasOwnProperty("align"))
                    parserState.lexicalScope.align = false;
                parserState.indented = inputFlow.indentation();
            }
            if (inputFlow.eatSpace()) return null; // Skip whitespace

            tokenCategory = tokenContent = null; // Reset scratch variables
            var tokenStyle = parserState.currentTokenizer(inputFlow, parserState);
            if (tokenStyle == "code-comment") return tokenStyle; // Comments don't affect parsing

            if (!parserState.lexicalScope.hasOwnProperty("align"))
                parserState.lexicalScope.align = true;
            if (tokenCategory == "path-prefix") return tokenStyle;
            if (!tokenContent) tokenContent = inputFlow.current(); // Ensure token content is set
            return executeParser(parserState, inputFlow, tokenStyle);
        },

        calculateIndent: function(parserState, remainingText) {
            if (parserState.currentTokenizer != primaryTokenizer) return 0; // Only indent for primary mode
            var leadingCharacter = remainingText && remainingText.charAt(0), lexicalScope = parserState.lexicalScope,
                scopeType = lexicalScope.scopeType, isClosingBracket = leadingCharacter == scopeType;
            if (scopeType == "statement-unit") return lexicalScope.indented + baseIndentSize;
            if (lexicalScope.align) return lexicalScope.column + (isClosingBracket ? 0 : 1);
            return lexicalScope.indented + (isClosingBracket ? 0 : (lexicalScope.scopeInfo == "match-construct" ? nestedIndentSize : baseIndentSize));
        },

        triggerCharacters: "{}" // Characters that trigger automatic indentation adjustment
    };
});

SyntaxHighlighter.defineMIME("text/x-oxidized-source", "oxidized");