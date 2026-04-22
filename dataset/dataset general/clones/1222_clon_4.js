SyntaxHighlighter.registerLanguageProcessor("rusty", function() {

  const standardTabSize = 4;
  const alternateIndentSize = 2;

  const codeKeywords = new Map([
    ["if", "if-flow"], ["while", "if-flow"], ["else", "else-flow"],
    ["do", "else-flow"], ["ret", "else-flow"], ["fail", "else-flow"],
    ["break", "atomic_unit"], ["cont", "atomic_unit"], ["const", "declaration"],
    ["resource", "function_def"], ["let", "declaration"], ["fn", "function_def"],
    ["for", "loop_construct"], ["alt", "match_construct"], ["obj", "function_def"],
    ["lambda", "function_def"], ["type", "type_def"], ["tag", "enum_def"],
    ["mod", "module_def"], ["as", "operator_symbol"], ["true", "atomic_unit"],
    ["false", "atomic_unit"], ["assert", "operator_symbol"], ["check", "operator_symbol"],
    ["claim", "operator_symbol"], ["native", "ignore_token"], ["unsafe", "ignore_token"],
    ["import", "else-flow"], ["export", "else-flow"], ["copy", "operator_symbol"],
    ["log", "operator_symbol"], ["log_err", "operator_symbol"]
  ]);

  const typeSystemKeywords = (function() {
    const keywordMap = new Map([
      ["fn", "function_def"], ["block", "function_def"], ["obj", "object_type"]
    ]);
    const primitiveTypes = "bool uint int i8 i16 i32 i64 u8 u16 u32 u64 float f32 f64 str char".split(" ");
    primitiveTypes.forEach(prim => keywordMap.set(prim, "atomic_unit"));
    return keywordMap;
  })();

  const symbolicOperators = /[+\-*&%=<>!?|\.@]/;

  class CodeFragmentScanner {
    constructor() {
      this.currentScanFunction = this.scanNormalMode;
      this.multiLineCommentDepth = 0;
      this.lastFragmentCategory = null;
      this.lastFragmentContent = null;
    }

    categorizeFragment(category, style) {
      this.lastFragmentCategory = category;
      return style;
    }

    scanNormalMode(inputFlow, scannerState) {
      const character = inputFlow.next();

      if (character === '"') {
        scannerState.currentScanner = this.scanStringLiteral;
        return scannerState.currentScanner.call(this, inputFlow, scannerState);
      }
      if (character === "'") {
        this.lastFragmentCategory = "atomic_unit";
        if (inputFlow.eat("\\")) {
          if (inputFlow.skipTo("'")) { inputFlow.next(); return "string"; }
          else { return "error"; }
        } else {
          inputFlow.next();
          return inputFlow.eat("'") ? "string" : "error";
        }
      }
      if (character === "/") {
        if (inputFlow.eat("/")) { inputFlow.skipToEnd(); return "comment"; }
        if (inputFlow.eat("*")) {
          scannerState.currentScanner = this.scanCommentBlock(1);
          return scannerState.currentScanner.call(this, inputFlow, scannerState);
        }
      }
      if (character === "#") {
        if (inputFlow.eat("[")) { this.lastFragmentCategory = "open-attribute"; return null; }
        inputFlow.eatWhile(/\w/);
        return this.categorizeFragment("macro_call", "meta");
      }
      if (character === ":" && inputFlow.match("::<")) {
        return this.categorizeFragment("operator_symbol", null);
      }
      if (character.match(/\d/) || (character === "." && inputFlow.eat(/\d/))) {
        let isFloatingPoint = false;
        if (!inputFlow.match(/^x[\da-f]+/i) && !inputFlow.match(/^b[01]+/)) {
          inputFlow.eatWhile(/\d/);
          if (inputFlow.eat(".")) { isFloatingPoint = true; inputFlow.eatWhile(/\d/); }
          if (inputFlow.match(/^e[+\-]?\d+/i)) { isFloatingPoint = true; }
        }
        if (isFloatingPoint) inputFlow.match(/^f(?:32|64)/);
        else inputFlow.match(/^[ui](?:8|16|32|64)/);
        return this.categorizeFragment("atomic_unit", "number");
      }
      if (character.match(/[()\[\]{}:;,]/)) return this.categorizeFragment(character, null);
      if (character === "-" && inputFlow.eat(">")) return this.categorizeFragment("arrow_symbol", null);
      if (character.match(symbolicOperators)) {
        inputFlow.eatWhile(symbolicOperators);
        return this.categorizeFragment("operator_symbol", null);
      }
      inputFlow.eatWhile(/\w/);
      this.lastFragmentContent = inputFlow.current();
      if (inputFlow.match(/^::\w/)) {
        inputFlow.backUp(1);
        return this.categorizeFragment("prefix_identifier", "variable-2");
      }
      if (scannerState.activeKeywords.has(this.lastFragmentContent))
        return this.categorizeFragment(scannerState.activeKeywords.get(this.lastFragmentContent), "keyword");
      return this.categorizeFragment("named_identifier", "variable");
    }

    scanStringLiteral(inputFlow, scannerState) {
      let currentCharacter, isEscaped = false;
      while (currentCharacter = inputFlow.next()) {
        if (currentCharacter === '"' && !isEscaped) {
          scannerState.currentScanner = this.scanNormalMode;
          return this.categorizeFragment("atomic_unit", "string");
        }
        isEscaped = !isEscaped && currentCharacter === "\\";
      }
      return this.categorizeFragment("operator_symbol", "string");
    }

    scanCommentBlock(nestingLevel) {
      return (inputFlow, scannerState) => {
        let previousCharacter = null, currentCharacter;
        while (currentCharacter = inputFlow.next()) {
          if (currentCharacter === "/" && previousCharacter === "*") {
            if (nestingLevel === 1) {
              scannerState.currentScanner = this.scanNormalMode;
              break;
            } else {
              scannerState.currentScanner = this.scanCommentBlock(nestingLevel - 1);
              return scannerState.currentScanner.call(this, inputFlow, scannerState);
            }
          }
          if (currentCharacter === "*" && previousCharacter === "/") {
            scannerState.currentScanner = this.scanCommentBlock(nestingLevel + 1);
            return scannerState.currentScanner.call(this, inputFlow, scannerState);
          }
          previousCharacter = currentCharacter;
        }
        return "comment";
      };
    }
  }

  class SyntaxAnalyzer {
    constructor() {
      this.parsingExpectations = [];
      this.lexicalScopeStack = null;
      this.currentHighlightedStyle = null;
      this.currentStream = null;
      this.currentProcessorState = null;
      this.currentCategory = null;
      this.currentContent = null;
    }

    deferParsing(...expectationHandlers) {
      for (let index = expectationHandlers.length - 1; index >= 0; index--) {
        this.parsingExpectations.push(expectationHandlers[index]);
      }
    }

    initiateParsing(...expectationHandlers) {
      this.deferParsing(...expectationHandlers);
      return true;
    }

    establishScope(scopeType, scopeInfo) {
      const scopeAction = () => {
        const existingState = this.currentProcessorState;
        this.lexicalScopeStack = {
          indentedBy: existingState.currentIndentation,
          startColumn: this.currentStream.column(),
          scopeType: scopeType,
          previousScope: this.lexicalScopeStack,
          scopeInfo: scopeInfo
        };
      };
      scopeAction.isLexicalOp = true;
      return scopeAction;
    }

    closeScope() {
      const scopeAction = () => {
        if (this.lexicalScopeStack.previousScope) {
          if (this.lexicalScopeStack.scopeType === ")")
            this.currentProcessorState.currentIndentation = this.lexicalScopeStack.indentedBy;
          this.lexicalScopeStack = this.lexicalScopeStack.previousScope;
        }
      };
      scopeAction.isLexicalOp = true;
      return scopeAction;
    }

    activateTypeContext() {
      const contextAction = () => { this.currentProcessorState.activeKeywords = typeSystemKeywords; };
      contextAction.isLexicalOp = true;
      return contextAction;
    }

    activateValueContext() {
      const contextAction = () => { this.currentProcessorState.activeKeywords = codeKeywords; };
      contextAction.isLexicalOp = true;
      return contextAction;
    }

    processSeparatedList(itemHandler, closingSymbol) {
      const moreItems = (fragmentCategory) => {
        if (fragmentCategory === ",") return this.initiateParsing(itemHandler.bind(this), moreItems.bind(this));
        if (fragmentCategory === closingSymbol) return this.initiateParsing();
        return this.initiateParsing(moreItems.bind(this));
      };
      return (fragmentCategory) => {
        if (fragmentCategory === closingSymbol) return this.initiateParsing();
        return this.deferParsing(itemHandler.bind(this), moreItems.bind(this));
      };
    }

    handleCodeBlock(fragmentCategory) {
      if (fragmentCategory === "}") return this.initiateParsing();
      if (fragmentCategory === "declaration") return this.initiateParsing(this.establishScope("statement_scope", "let_decl"), this.defineVariable.bind(this), this.closeScope(), this.handleCodeBlock.bind(this));
      if (fragmentCategory === "function_def") return this.initiateParsing(this.establishScope("statement_scope"), this.defineFunction.bind(this), this.closeScope(), this.handleCodeBlock.bind(this));
      if (fragmentCategory === "type_def") return this.initiateParsing(this.establishScope("statement_scope"), this.defineTypeAlias.bind(this), this.finalizeStatement.bind(this), this.closeScope(), this.handleCodeBlock.bind(this));
      if (fragmentCategory === "enum_def") return this.initiateParsing(this.establishScope("statement_scope"), this.defineEnumVariant.bind(this), this.closeScope(), this.handleCodeBlock.bind(this));
      if (fragmentCategory === "module_def") return this.initiateParsing(this.establishScope("statement_scope"), this.defineModule.bind(this), this.closeScope(), this.handleCodeBlock.bind(this));
      if (fragmentCategory === "open-attribute") return this.initiateParsing(this.establishScope("square_bracket_scope"), this.processSeparatedList(this.analyzeExpression.bind(this), "]"), this.closeScope());
      if (fragmentCategory === "ignore_token") return this.initiateParsing(this.handleCodeBlock.bind(this));
      return this.deferParsing(this.establishScope("statement_scope"), this.analyzeExpression.bind(this), this.closeScope(), this.finalizeStatement.bind(this), this.handleCodeBlock.bind(this));
    }

    finalizeStatement(fragmentCategory) {
      if (fragmentCategory === ";") return this.initiateParsing();
      return this.deferParsing();
    }

    analyzeExpression(fragmentCategory) {
      if (fragmentCategory === "atomic_unit" || fragmentCategory === "named_identifier") return this.initiateParsing(this.potentialOperator.bind(this));
      if (fragmentCategory === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope"), this.handleBraceExpression.bind(this), this.closeScope());
      if (fragmentCategory.match(/[\[\(]/)) return this.matchEnclosures(fragmentCategory, this.analyzeExpression.bind(this));
      if (fragmentCategory.match(/[\]\)\};,]/)) return this.deferParsing();
      if (fragmentCategory === "if-flow") return this.initiateParsing(this.analyzeExpression.bind(this), this.analyzeExpression.bind(this));
      if (fragmentCategory === "else-flow" || fragmentCategory === "operator_symbol") return this.initiateParsing(this.analyzeExpression.bind(this));
      if (fragmentCategory === "loop_construct") return this.initiateParsing(this.analyzePattern.bind(this), this.optionalTypeAnnotation.bind(this), this.handleInOperator.bind(this), this.analyzeExpression.bind(this), this.analyzeExpression.bind(this));
      if (fragmentCategory === "match_construct") return this.initiateParsing(this.analyzeExpression.bind(this), this.handleMatchBody.bind(this));
      if (fragmentCategory === "function_def") return this.initiateParsing(this.defineFunction.bind(this));
      if (fragmentCategory === "macro_call") return this.initiateParsing(this.processMacroCall.bind(this));
      return this.initiateParsing();
    }

    potentialOperator(fragmentCategory) {
      if (this.currentContent === ".") return this.initiateParsing(this.potentialProperty.bind(this));
      if (this.currentContent === "::<") { return this.initiateParsing(this.handleTypeParameters.bind(this), this.potentialOperator.bind(this)); }
      if (fragmentCategory === "operator_symbol" || this.currentContent === ":") return this.initiateParsing(this.analyzeExpression.bind(this));
      if (fragmentCategory === "(" || fragmentCategory === "[") return this.matchEnclosures(fragmentCategory, this.analyzeExpression.bind(this));
      return this.deferParsing();
    }

    potentialProperty(fragmentCategory) {
      if (this.currentContent.match(/^\w+$/)) { this.currentHighlightedStyle = "variable"; return this.initiateParsing(this.potentialOperator.bind(this)); }
      return this.deferParsing(this.analyzeExpression.bind(this));
    }

    handleBraceExpression(fragmentCategory) {
      if (fragmentCategory === "operator_symbol") {
        if (this.currentContent === "|") return this.initiateParsing(this.handleBlockVariables.bind(this), this.closeScope(), this.establishScope("curly_bracket_scope", "block_scope"), this.handleCodeBlock.bind(this));
        if (this.currentContent === "||") return this.initiateParsing(this.closeScope(), this.establishScope("curly_bracket_scope", "block_scope"), this.handleCodeBlock.bind(this));
      }
      if (this.currentContent === "mutable" || (this.currentContent.match(/^\w+$/) && this.currentStream.peek() === ":" && !this.currentStream.match("::", false))) return this.deferParsing(this.processRecordLiteral.bind(this));
      return this.deferParsing(this.handleCodeBlock.bind(this));
    }

    processRecordLiteral(fragmentCategory) {
      if (this.currentContent === "mutable" || this.currentContent === "with") { this.currentHighlightedStyle = "keyword"; return this.initiateParsing(this.processRecordLiteral.bind(this)); }
      if (this.currentContent.match(/^\w*$/)) { this.currentHighlightedStyle = "variable"; return this.initiateParsing(this.processRecordLiteral.bind(this)); }
      if (fragmentCategory === ":") return this.initiateParsing(this.analyzeExpression.bind(this), this.processRecordLiteral.bind(this));
      if (fragmentCategory === "}") return this.initiateParsing();
      return this.initiateParsing(this.processRecordLiteral.bind(this));
    }

    handleBlockVariables(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.handleBlockVariables.bind(this)); }
      if (fragmentCategory === "operator_symbol" && this.currentContent === "|") return this.initiateParsing();
      return this.initiateParsing(this.handleBlockVariables.bind(this));
    }

    defineVariable(fragmentCategory) {
      if (fragmentCategory === ";") return this.initiateParsing();
      if (this.currentContent === "=") return this.initiateParsing(this.analyzeExpression.bind(this), this.defineVariable.bind(this));
      if (fragmentCategory === ",") return this.initiateParsing(this.defineVariable.bind(this));
      return this.deferParsing(this.analyzePattern.bind(this), this.optionalTypeAnnotation.bind(this), this.defineVariable.bind(this));
    }

    optionalTypeAnnotation(fragmentCategory) {
      if (fragmentCategory === ":") return this.initiateParsing(this.activateTypeContext(), this.parseTypeReference.bind(this), this.activateValueContext());
      return this.deferParsing();
    }

    handleInOperator(fragmentCategory) {
      if (fragmentCategory === "named_identifier" && this.currentContent === "in") { this.currentHighlightedStyle = "keyword"; return this.initiateParsing(); }
      return this.deferParsing();
    }

    defineFunction(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.defineFunction.bind(this)); }
      if (this.currentContent === "<") return this.initiateParsing(this.handleTypeParameters.bind(this), this.defineFunction.bind(this));
      if (fragmentCategory === "{") return this.deferParsing(this.analyzeExpression.bind(this));
      if (fragmentCategory === "(") return this.initiateParsing(this.establishScope("parenthesis_scope"), this.processSeparatedList(this.defineArgument.bind(this), ")"), this.closeScope(), this.defineFunction.bind(this));
      if (fragmentCategory === "arrow_symbol") return this.initiateParsing(this.activateTypeContext(), this.parseTypeReference.bind(this), this.activateValueContext(), this.defineFunction.bind(this));
      return this.initiateParsing(this.defineFunction.bind(this));
    }

    defineTypeAlias(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.defineTypeAlias.bind(this)); }
      if (this.currentContent === "<") return this.initiateParsing(this.handleTypeParameters.bind(this), this.defineTypeAlias.bind(this));
      if (this.currentContent === "=") return this.initiateParsing(this.activateTypeContext(), this.parseTypeReference.bind(this), this.activateValueContext());
      return this.initiateParsing(this.defineTypeAlias.bind(this));
    }

    defineEnumVariant(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.defineEnumVariant.bind(this)); }
      if (this.currentContent === "<") return this.initiateParsing(this.handleTypeParameters.bind(this), this.defineEnumVariant.bind(this));
      if (this.currentContent === "=") return this.initiateParsing(this.activateTypeContext(), this.parseTypeReference.bind(this), this.activateValueContext(), this.finalizeStatement.bind(this));
      if (fragmentCategory === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope"), this.activateTypeContext(), this.handleEnumBlock.bind(this), this.activateValueContext(), this.closeScope());
      return this.initiateParsing(this.defineEnumVariant.bind(this));
    }

    handleEnumBlock(fragmentCategory) {
      if (fragmentCategory === "}") return this.initiateParsing();
      if (fragmentCategory === "(") return this.initiateParsing(this.establishScope("parenthesis_scope"), this.processSeparatedList(this.parseTypeReference.bind(this), ")"), this.closeScope(), this.handleEnumBlock.bind(this));
      if (this.currentContent.match(/^\w+$/)) this.currentHighlightedStyle = "def";
      return this.initiateParsing(this.handleEnumBlock.bind(this));
    }

    defineModule(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.defineModule.bind(this)); }
      if (fragmentCategory === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope"), this.handleCodeBlock.bind(this), this.closeScope());
      return this.deferParsing();
    }

    handleTypeParameters(fragmentCategory) {
      if (this.currentContent === ">") return this.initiateParsing();
      if (this.currentContent === ",") return this.initiateParsing(this.handleTypeParameters.bind(this));
      return this.deferParsing(this.parseTypeReference.bind(this), this.handleTypeParameters.bind(this));
    }

    defineArgument(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.defineArgument.bind(this)); }
      if (fragmentCategory === ":") return this.initiateParsing(this.activateTypeContext(), this.parseTypeReference.bind(this), this.activateValueContext());
      return this.deferParsing();
    }

    parseTypeReference(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "variable-3"; return this.initiateParsing(this.typeParamSuffix.bind(this)); }
      if (this.currentContent === "mutable") { this.currentHighlightedStyle = "keyword"; return this.initiateParsing(this.parseTypeReference.bind(this)); }
      if (fragmentCategory === "atomic_unit") return this.initiateParsing(this.typeParamSuffix.bind(this));
      if (fragmentCategory === "operator_symbol" || fragmentCategory === "object_type") return this.initiateParsing(this.parseTypeReference.bind(this));
      if (fragmentCategory === "function_def") return this.initiateParsing(this.parseFunctionType.bind(this));
      return this.matchEnclosures(fragmentCategory, this.parseTypeReference.bind(this));
    }

    typeParamSuffix(fragmentCategory) {
      if (this.currentContent === "<") return this.initiateParsing(this.handleTypeParameters.bind(this));
      return this.deferParsing();
    }

    parseFunctionType(fragmentCategory) {
      if (fragmentCategory === "(") return this.initiateParsing(this.establishScope("parenthesis_scope"), this.processSeparatedList(this.parseTypeReference.bind(this), ")"), this.closeScope(), this.parseFunctionType.bind(this));
      if (fragmentCategory === "arrow_symbol") return this.initiateParsing(this.parseTypeReference.bind(this));
      return this.deferParsing();
    }

    analyzePattern(fragmentCategory) {
      if (fragmentCategory === "named_identifier") { this.currentHighlightedStyle = "def"; return this.initiateParsing(this.patternOperator.bind(this)); }
      if (fragmentCategory === "atomic_unit") return this.initiateParsing(this.patternOperator.bind(this));
      if (fragmentCategory === "operator_symbol") return this.initiateParsing(this.analyzePattern.bind(this));
      return this.matchEnclosures(fragmentCategory, this.analyzePattern.bind(this));
    }

    patternOperator(fragmentCategory) {
      if (fragmentCategory === "operator_symbol" && this.currentContent === ".") return this.initiateParsing();
      if (this.currentContent === "to") { this.currentHighlightedStyle = "keyword"; return this.initiateParsing(this.analyzePattern.bind(this)); }
      else return this.deferParsing();
    }

    handleMatchBody(fragmentCategory) {
      if (fragmentCategory === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope", "match_alt"), this.handleMatchCase.bind(this), this.closeScope());
      return this.deferParsing();
    }

    handleMatchCase(fragmentCategory) {
      if (fragmentCategory === "}") return this.initiateParsing();
      if (fragmentCategory === "|") return this.initiateParsing(this.handleMatchCase.bind(this));
      if (this.currentContent === "when") { this.currentHighlightedStyle = "keyword"; return this.initiateParsing(this.analyzeExpression.bind(this), this.handleMatchCase.bind(this)); }
      if (fragmentCategory === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope", "match_alt"), this.handleCodeBlock.bind(this), this.closeScope(), this.handleMatchCase.bind(this));
      return this.deferParsing(this.analyzePattern.bind(this), this.handleMatchCase.bind(this));
    }

    processMacroCall(fragmentCategory) {
      if (fragmentCategory.match(/[\[\(\{]/)) return this.matchEnclosures(fragmentCategory, this.analyzeExpression.bind(this));
      return this.deferParsing();
    }

    matchEnclosures(openingSymbol, itemHandler) {
      if (openingSymbol === "[") return this.initiateParsing(this.establishScope("square_bracket_scope"), this.processSeparatedList(itemHandler, "]"), this.closeScope());
      if (openingSymbol === "(") return this.initiateParsing(this.establishScope("parenthesis_scope"), this.processSeparatedList(itemHandler, ")"), this.closeScope());
      if (openingSymbol === "{") return this.initiateParsing(this.establishScope("curly_bracket_scope"), this.processSeparatedList(itemHandler, "}"), this.closeScope());
      return this.initiateParsing();
    }

    executeParseCycle(processorState, inputFlow, fragmentStyle) {
      this.currentProcessorState = processorState;
      this.currentStream = inputFlow;
      this.currentHighlightedStyle = null;
      this.currentCategory = processorState.lastFragmentCategory;
      this.currentContent = processorState.lastFragmentContent;
      this.lexicalScopeStack = processorState.lexicalContext;

      if (this.parsingExpectations.length === 0) {
        this.deferParsing(this.handleCodeBlock.bind(this));
      }

      while (true) {
        const currentExpectation = this.parsingExpectations.pop();
        if (currentExpectation(this.currentCategory)) {
          while (this.parsingExpectations.length > 0 && this.parsingExpectations[this.parsingExpectations.length - 1].isLexicalOp) {
            this.parsingExpectations.pop()();
          }
          processorState.lexicalContext = this.lexicalScopeStack;
          return this.currentHighlightedStyle || fragmentStyle;
        }
      }
    }
  }

  const modeScanner = new CodeFragmentScanner();
  const modeParser = new SyntaxAnalyzer();

  return {
    initializeProcessorState: function() {
      return {
        currentScanner: modeScanner.scanNormalMode,
        parsingExpectations: [],
        lexicalContext: {indentedBy: -standardTabSize, startColumn: 0, scopeType: "top_level", aligned: false},
        activeKeywords: codeKeywords,
        currentIndentation: 0,
        lastFragmentCategory: null,
        lastFragmentContent: null
      };
    },

    processInputToken: function(inputFlow, processorState) {
      if (inputFlow.sol()) {
        if (!processorState.lexicalContext.hasOwnProperty("aligned"))
          processorState.lexicalContext.aligned = false;
        processorState.currentIndentation = inputFlow.indentation();
      }
      if (inputFlow.eatSpace()) return null;

      modeScanner.lastFragmentCategory = null;
      modeScanner.lastFragmentContent = null;

      const fragmentStyle = processorState.currentScanner.call(modeScanner, inputFlow, processorState);

      if (fragmentStyle === "comment") return fragmentStyle;

      if (!processorState.lexicalContext.hasOwnProperty("aligned"))
        processorState.lexicalContext.aligned = true;

      if (modeScanner.lastFragmentCategory === "prefix_identifier") {
        processorState.lastFragmentCategory = modeScanner.lastFragmentCategory;
        processorState.lastFragmentContent = modeScanner.lastFragmentContent;
        return fragmentStyle;
      }

      processorState.lastFragmentCategory = modeScanner.lastFragmentCategory;
      processorState.lastFragmentContent = modeScanner.lastFragmentContent;

      modeParser.parsingExpectations = processorState.parsingExpectations;
      modeParser.lexicalScopeStack = processorState.lexicalContext;
      const parsedStyle = modeParser.executeParseCycle(processorState, inputFlow, fragmentStyle);
      processorState.parsingExpectations = modeParser.parsingExpectations;
      processorState.lexicalContext = modeParser.lexicalScopeStack;

      return parsedStyle;
    },

    calculateIndentation: function(processorState, textAfterLine) {
      if (processorState.currentScanner !== modeScanner.scanNormalMode) return 0;
      const firstCharacter = textAfterLine && textAfterLine.charAt(0);
      const currentLexical = processorState.lexicalContext;
      const isClosingSymbol = firstCharacter === currentLexical.scopeType;

      if (currentLexical.scopeType === "statement_scope") return currentLexical.indentedBy + standardTabSize;
      if (currentLexical.aligned) return currentLexical.startColumn + (isClosingSymbol ? 0 : 1);
      return currentLexical.indentedBy + (isClosingSymbol ? 0 : (currentLexical.scopeInfo === "match_alt" ? alternateIndentSize : standardTabSize));
    },

    triggerCharacters: "{}"
  };
});

SyntaxHighlighter.associateMimeType("text/rusty-source", "rusty");