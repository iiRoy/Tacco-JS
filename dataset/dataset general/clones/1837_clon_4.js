const fileSystemAccess = require("fs");

const utilityBelt = {
    isCollection: Array.isArray,
    unfold: (arr) => arr.flat(Infinity),
    isTextual: (val) => typeof val === "string",
    isNumeric: (val) => typeof val === "number" && !isNaN(val),
    isEnumeration: (val) => utilityBelt.isNumeric(val),
    objectKeysAsArray: (obj) => Object.keys(obj),
    capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    SourcePosition: class {
        constructor(line, col, origin) {
            this.line = line;
            this.col = col;
            this.origin = origin;
        }
        toString() {
            return `${this.origin}:${this.line}:${this.col}`;
        }
    }
};

const blueprint = {
    Dimension: {
        Individual: Symbol('Individual'),
        Collection: Symbol('Collection')
    },
    Structure: {
        Flexible: Symbol('Flexible'),
        Rigid: Symbol('Rigid')
    },
    Availability: {
        Optional: Symbol('Optional'),
        Mandatory: Symbol('Mandatory')
    },
    DataKind: {
        SignedByte: Symbol('I8'),
        UnsignedByte: Symbol('U8'),
        SignedShort: Symbol('I16'),
        UnsignedShort: Symbol('U16'),
        SignedInt: Symbol('I32'),
        UnsignedInt: Symbol('U32'),
        SignedLong: Symbol('I64'),
        UnsignedLong: Symbol('U64'),
        FloatSingle: Symbol('F32'),
        FloatDouble: Symbol('F64'),
        Boolean: Symbol('Bool'),
        ObjectReference: Symbol('Object'),
        DateTime: Symbol('Time'),
        String: Symbol('String'),
        Binary: Symbol('Binary'),
        Fixed: Symbol('Fixed')
    },
    ModelStructure: class ModelStructure {},
    PathClassification: {
        Name: Symbol('NamePath'),
        Type: Symbol('TypePath')
    }
};

const structureAssembler = {
    create: (model) => {
        const observer = {};
        const eventHandlers = [
            "onNamespaceDeclaration", "onBeginGroupDefinition", "onEndGroupDefinition",
            "onBeginFieldSpecification", "onEndFieldSpecification",
            "onBeginDefinition", "onEndDefinition", "onBeginEnumeration", "onEndEnumeration",
            "onTypeReference", "onStringTypeDefinition", "onBinaryTypeDefinition", "onFixedTypeDefinition",
            "onPrimitiveTypeDefinition", "onEnumerationSymbol",
            "onSchemaAnnotation", "onIncrementalAnnotation"
        ];
        eventHandlers.forEach(handlerName => {
            observer[handlerName] = (...args) => {};
        });
        return observer;
    }
};

const tokenCategories = {
    IDENTIFIER: 'IDENTIFIER',
    QUALIFIED_IDENTIFIER: 'QUALIFIED_IDENTIFIER',
    STRING_LITERAL: 'STRING_LITERAL',
    UNSIGNED_INT: 'UNSIGNED_INT',
    SIGNED_INT: 'SIGNED_INT',
    HEX_NUMBER: 'HEX_NUMBER',
    KEYWORD: 'KEYWORD',
    PUNCTUATOR: 'PUNCTUATOR',
    END_OF_FILE: 'END_OF_FILE'
};

const grammarKeywords = new Set([
    "namespace", "group", "define", "enum", "string", "binary", "fixed",
    "i8", "u8", "i16", "u16", "i32", "u32", "i64", "u64",
    "f32", "f64", "bool", "object", "time"
]);

const punctuators = new Set([
    "@", "=", "/", "[", "]", "(", ")", ":", "->", "?", ",", "|", "*", "<-"
]);

class LexicalAnalyzer {
    constructor(sourceCode, originName) {
        this.source = sourceCode;
        this.origin = originName;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.lastConsumedSegment = null;
        this.nextSegmentCache = null;
    }

    signalParsingError(message) {
        throw new Error(`Syntax Error at ${this.origin}:${this.line}:${this.column}: ${message}`);
    }

    peekCurrentChar() {
        return this.source[this.position];
    }

    advancePosition() {
        const char = this.source[this.position];
        this.position++;
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    purgeWhitespaceAndComments() {
        while (this.position < this.source.length) {
            const char = this.peekCurrentChar();
            if (/\s/.test(char)) {
                this.advancePosition();
            } else if (char === '/' && this.source[this.position + 1] === '/') {
                while (this.position < this.source.length && this.peekCurrentChar() !== '\n') {
                    this.advancePosition();
                }
            } else if (char === '/' && this.source[this.position + 1] === '*') {
                this.advancePosition();
                this.advancePosition();
                while (this.position < this.source.length) {
                    if (this.peekCurrentChar() === '*' && this.source[this.position + 1] === '/') {
                        this.advancePosition();
                        this.advancePosition();
                        break;
                    }
                    this.advancePosition();
                }
            } else {
                break;
            }
        }
    }

    generateNextSegment() {
        this.purgeWhitespaceAndComments();

        if (this.position >= this.source.length) {
            return { type: tokenCategories.END_OF_FILE, value: null, location: new utilityBelt.SourcePosition(this.line, this.column, this.origin) };
        }

        const startLine = this.line;
        const startColumn = this.column;
        const currentChar = this.peekCurrentChar();

        for (const p of [...punctuators].sort((a,b) => b.length - a.length)) {
            if (this.source.substring(this.position, this.position + p.length) === p) {
                for (let i = 0; i < p.length; i++) this.advancePosition();
                return { type: tokenCategories.PUNCTUATOR, value: p, location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
            }
        }

        if (currentChar === '"') {
            this.advancePosition();
            let value = '';
            while (this.position < this.source.length && this.peekCurrentChar() !== '"') {
                if (this.peekCurrentChar() === '\\') {
                    this.advancePosition();
                    const escapedChar = this.advancePosition();
                    switch (escapedChar) {
                        case 'n': value += '\n'; break;
                        case 't': value += '\t'; break;
                        case 'r': value += '\r'; break;
                        case '\\': value += '\\'; break;
                        case '"': value += '"'; break;
                        case '/': value += '/'; break;
                        default: value += escapedChar; break;
                    }
                } else {
                    value += this.advancePosition();
                }
            }
            if (this.peekCurrentChar() !== '"') {
                this.signalParsingError("Unterminated string literal");
            }
            this.advancePosition();
            return { type: tokenCategories.STRING_LITERAL, value, location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
        }

        if (/[0-9]/.test(currentChar)) {
            let valueStr = '';
            if (currentChar === '0' && this.source[this.position + 1]?.toLowerCase() === 'x') {
                this.advancePosition();
                this.advancePosition();
                while (/[0-9a-fA-F]/.test(this.peekCurrentChar())) {
                    valueStr += this.advancePosition();
                }
                if (valueStr === '') this.signalParsingError("Invalid hexadecimal number");
                return { type: tokenCategories.HEX_NUMBER, value: parseInt(valueStr, 16), location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
            } else {
                let hasSign = false;
                if (currentChar === '-' && this.position + 1 < this.source.length && /[0-9]/.test(this.source[this.position+1])) {
                    hasSign = true;
                    valueStr += this.advancePosition();
                }
                while (/[0-9]/.test(this.peekCurrentChar())) {
                    valueStr += this.advancePosition();
                }
                if (hasSign) {
                    return { type: tokenCategories.SIGNED_INT, value: parseInt(valueStr, 10), location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
                } else {
                    return { type: tokenCategories.UNSIGNED_INT, value: parseInt(valueStr, 10), location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
                }
            }
        }

        if (/[a-zA-Z_]/.test(currentChar)) {
            let value = '';
            while (/[a-zA-Z0-9_.]/.test(this.peekCurrentChar())) {
                value += this.advancePosition();
            }
            if (value.includes('.')) {
                return { type: tokenCategories.QUALIFIED_IDENTIFIER, value, location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
            } else if (grammarKeywords.has(value)) {
                return { type: tokenCategories.KEYWORD, value, location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
            } else {
                return { type: tokenCategories.IDENTIFIER, value, location: new utilityBelt.SourcePosition(startLine, startColumn, this.origin) };
            }
        }

        this.signalParsingError(`Unexpected character: '${currentChar}'`);
    }

    advanceIfPresent(...expectedMatchArgs) {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }

        if (this.nextSegmentCache.type === tokenCategories.END_OF_FILE) {
            return null;
        }

        const isMatch = this.checkSegmentMatch(this.nextSegmentCache, expectedMatchArgs);
        
        if (isMatch) {
            this.lastConsumedSegment = this.nextSegmentCache;
            this.nextSegmentCache = null;
            return this.lastConsumedSegment.value;
        }
        return null;
    }

    testCurrentSegment(...expectedMatchArgs) {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }

        if (this.nextSegmentCache.type === tokenCategories.END_OF_FILE) {
            return false;
        }

        return this.checkSegmentMatch(this.nextSegmentCache, expectedMatchArgs);
    }

    checkSegmentMatch(segment, expectedMatchArgs) {
        if (expectedMatchArgs.length === 0) {
            return true;
        }

        for (const expected of expectedMatchArgs) {
            if (typeof expected === 'string') {
                if (punctuators.has(expected) || grammarKeywords.has(expected)) {
                    if (segment.value === expected) return true;
                } else if (expected === 'Name') {
                    if (segment.type === tokenCategories.IDENTIFIER) return true;
                } else if (expected === 'Qname') {
                    if (segment.type === tokenCategories.IDENTIFIER || segment.type === tokenCategories.QUALIFIED_IDENTIFIER) return true;
                } else if (expected === 'String') {
                    if (segment.type === tokenCategories.STRING_LITERAL) return true;
                } else if (expected === 'Uint') {
                    if (segment.type === tokenCategories.UNSIGNED_INT) return true;
                } else if (expected === 'Int') {
                    if (segment.type === tokenCategories.SIGNED_INT || segment.type === tokenCategories.UNSIGNED_INT) return true;
                } else if (expected === 'Hex') {
                    if (segment.type === tokenCategories.HEX_NUMBER) return true;
                } else if (Object.values(tokenCategories).includes(expected)) {
                    if (segment.type === expected) return true;
                }
            } else if (Object.values(tokenCategories).includes(expected)) {
                if (segment.type === expected) return true;
            }
        }
        return false;
    }

    demandSegment(expectedTypeOrValue, errorMessage = `Expected ${expectedTypeOrValue}`) {
        const token = this.peekNextSegment();
        if (token.type === tokenCategories.END_OF_FILE) {
            this.signalParsingError(`Unexpected end of file. ${errorMessage}`);
        }

        const isMatch = this.checkSegmentMatch(token, [expectedTypeOrValue]);

        if (!isMatch) {
            this.signalParsingError(`${errorMessage}, but found '${token.value || token.type}'`);
        }
        this.lastConsumedSegment = this.nextSegmentCache;
        this.nextSegmentCache = null;
        return this.lastConsumedSegment.value;
    }

    advanceNameOrKeyword() {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }
        if (this.nextSegmentCache.type === tokenCategories.IDENTIFIER || this.nextSegmentCache.type === tokenCategories.KEYWORD) {
            this.lastConsumedSegment = this.nextSegmentCache;
            this.nextSegmentCache = null;
            return this.lastConsumedSegment.value;
        }
        return null;
    }
    
    testAnyPrimitiveKeyword() {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }
        return this.nextSegmentCache.type === tokenCategories.KEYWORD && 
               !["string", "binary", "fixed", "namespace", "group", "define", "enum"].includes(this.nextSegmentCache.value);
    }

    testLookaheadSequence(firstExpectedValue, secondExpectedValue) {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }
        if (!this.checkSegmentMatch(this.nextSegmentCache, [tokenCategories.IDENTIFIER, tokenCategories.QUALIFIED_IDENTIFIER])) return false;

        const originalPosition = this.position;
        const originalLine = this.line;
        const originalColumn = this.column;
        const originalLastConsumedSegment = this.lastConsumedSegment;
        const originalNextSegmentCache = this.nextSegmentCache;

        try {
            this.lastConsumedSegment = this.nextSegmentCache;
            this.nextSegmentCache = null;

            const firstLookaheadToken = this.peekNextSegment();
            if (firstLookaheadToken.value !== firstExpectedValue) return false;
            
            this.lastConsumedSegment = this.nextSegmentCache;
            this.nextSegmentCache = null;

            const secondLookaheadToken = this.peekNextSegment();
            if (secondLookaheadToken.value !== secondExpectedValue) return false;

            return true;
        } finally {
            this.position = originalPosition;
            this.line = originalLine;
            this.column = originalColumn;
            this.lastConsumedSegment = originalLastConsumedSegment;
            this.nextSegmentCache = originalNextSegmentCache;
        }
    }

    peekNextSegment() {
        if (!this.nextSegmentCache) {
            this.nextSegmentCache = this.generateNextSegment();
        }
        return this.nextSegmentCache;
    }

    retrieveLastLocation() {
        return this.lastConsumedSegment ? this.lastConsumedSegment.location : new utilityBelt.SourcePosition(this.line, this.column, this.origin);
    }

    retrieveCurrentLocation() {
        return this.peekNextSegment().location;
    }
}

const notificationTypes = new Set([
    "NamespaceDeclaration", "BeginGroupDefinition", "EndGroupDefinition",
    "BeginFieldSpecification", "EndFieldSpecification",
    "BeginDefinition", "EndDefinition", "BeginEnumeration", "EndEnumeration",
    "TypeReference", "StringTypeDefinition", "BinaryTypeDefinition", "FixedTypeDefinition",
    "PrimitiveTypeDefinition", "EnumerationSymbol",
    "SchemaAnnotation", "IncrementalAnnotation"
]);

function createEventDispatcher(recipient) {
    recipient = recipient || forgeLoggingFacility();
    if (recipient instanceof blueprint.ModelStructure) {
        recipient = structureAssembler.create(recipient);
    }

    const handlerContainer = {};
    notificationTypes.forEach(eventName => {
        const handlerName = "on" + eventName;
        const handlerMethod = recipient[handlerName];
        if (handlerMethod) {
            handlerContainer[handlerName] = function () { handlerMethod.apply(recipient, arguments); };
        } else {
            handlerContainer[handlerName] = function () { };
        }
    });
    return handlerContainer;
}

function forgeLoggingFacility() {
    const logger = {};
    notificationTypes.forEach(eventName => {
        logger["on" + eventName] = function () {
            const displayArgs = [];
            for (let i = 0; i < arguments.length; ++i) {
                const arg = arguments[i];
                if (utilityBelt.isTextual(arg)) {
                    displayArgs.push(`"${arg}"`);
                } else if (utilityBelt.isNumeric(arg) || utilityBelt.isEnumeration(arg)) {
                    displayArgs.push(arg);
                } else if (arg instanceof utilityBelt.SourcePosition) {
                    displayArgs.push(arg.toString());
                } else if (typeof arg === 'object' && arg !== null) {
                    const annots = utilityBelt.objectKeysAsArray(arg).map(key => {
                        return `${key}="${arg[key]}"`;
                    });
                    displayArgs.push(`[${annots.join(", ")}]`);
                } else {
                    displayArgs.push(String(arg));
                }
            }
            console.log(`${eventName} (${displayArgs.join(", ")})`);
        };
    });
    return logger;
}

class SchemaProcessor {
    constructor(dataContent, sourceOrigin, eventNotifier) {
        this.analyzer = new LexicalAnalyzer(dataContent, sourceOrigin);
        this.notifier = eventNotifier;

        this.activeAnnotations = {};
        this.deferredIdentifier = "";
        this.deferredName = "";
    }

    retrieveAndResetAnnotations() {
        const collected = this.activeAnnotations;
        this.activeAnnotations = {};
        return collected;
    }

    retrieveAndResetDeferredId() {
        const id = this.deferredIdentifier;
        this.deferredIdentifier = "";
        return id;
    }

    processSingleAnnotation() {
        const annotationName = this.analyzer.advanceNameOrKeyword() || this.analyzer.signalParsingError("Expected annotation name");
        this.analyzer.demandSegment("=", "Expected '=' after annotation name");
        let annotationValue = this.analyzer.demandSegment(tokenCategories.STRING_LITERAL, "Expected string literal for annotation value");
        
        while (this.analyzer.testCurrentSegment(tokenCategories.STRING_LITERAL)) {
            annotationValue += this.analyzer.advanceIfPresent(tokenCategories.STRING_LITERAL);
        }
        this.activeAnnotations[annotationName] = annotationValue;
    }

    processAllAnnotations() {
        while (this.analyzer.advanceIfPresent("@")) {
            this.processSingleAnnotation();
        }
    }

    processNamespaceDeclaration() {
        this.notifier.onNamespaceDeclaration(this.analyzer.demandSegment("Name", "Expected namespace name"));
    }

    extractNamedIdentifier(contextDescription) {
        this.deferredName = this.analyzer.demandSegment("Name", contextDescription);
        this.deferredIdentifier = "";
        if (this.analyzer.advanceIfPresent("/")) {
            this.deferredIdentifier = this.analyzer.advanceIfPresent(tokenCategories.UNSIGNED_INT, tokenCategories.HEX_NUMBER) ||
                                    this.analyzer.signalParsingError("Expected unsigned integer or hexadecimal number for ID");
        }
    }

    determineTypeDimension() {
        if (this.analyzer.advanceIfPresent("[")) {
            this.analyzer.demandSegment("]", "Expected ']' to close array dimension");
            return blueprint.Dimension.Collection;
        } else {
            return blueprint.Dimension.Individual;
        }
    }

    processTypeReference() {
        const typeName = this.analyzer.advanceIfPresent(tokenCategories.IDENTIFIER, tokenCategories.QUALIFIED_IDENTIFIER);
        const structure = this.analyzer.advanceIfPresent("*") ? blueprint.Structure.Flexible : blueprint.Structure.Rigid;
        const dimension = this.determineTypeDimension();
        this.notifier.onTypeReference(typeName, structure, dimension, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processStringType() {
        this.analyzer.advanceIfPresent("string");
        let maxTextSize;
        if (this.analyzer.advanceIfPresent("(")) {
            maxTextSize = this.analyzer.demandSegment(tokenCategories.UNSIGNED_INT, "Expected string max size");
            this.analyzer.demandSegment(")", "Expected ')' to close string max size");
        }
        const dimension = this.determineTypeDimension();
        this.notifier.onStringTypeDefinition(dimension, maxTextSize, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processBinaryType() {
        this.analyzer.advanceIfPresent("binary");
        let maxBinarySize;
        if (this.analyzer.advanceIfPresent("(")) {
            maxBinarySize = this.analyzer.demandSegment(tokenCategories.UNSIGNED_INT, "Expected binary max size");
            this.analyzer.demandSegment(")", "Expected ')' to close binary max size");
        }
        const dimension = this.determineTypeDimension();
        this.notifier.onBinaryTypeDefinition(dimension, maxBinarySize, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processFixedType() {
        this.analyzer.advanceIfPresent("fixed");
        this.analyzer.demandSegment("(", "Expected '(' for fixed size");
        const fixedSize = this.analyzer.demandSegment(tokenCategories.UNSIGNED_INT, "Expected fixed size");
        this.analyzer.demandSegment(")", "Expected ')' to close fixed size");
        const dimension = this.determineTypeDimension();
        this.notifier.onFixedTypeDefinition(dimension, fixedSize, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processPrimitiveType() {
        const primitiveTypeName = this.analyzer.advanceIfPresent(tokenCategories.KEYWORD);
        const typeCodeName = utilityBelt.capitalizeFirstLetter(primitiveTypeName);
        const primitiveTypeCode = blueprint.DataKind[typeCodeName]; 
        const dimension = this.determineTypeDimension();
        this.notifier.onPrimitiveTypeDefinition(primitiveTypeCode, dimension, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processTypeDefinition() {
        if (this.analyzer.testCurrentSegment(tokenCategories.IDENTIFIER, tokenCategories.QUALIFIED_IDENTIFIER)) {
            this.processTypeReference();
        } else if (this.analyzer.testCurrentSegment("string")) {
            this.processStringType();
        } else if (this.analyzer.testCurrentSegment("binary")) {
            this.processBinaryType();
        } else if (this.analyzer.testCurrentSegment("fixed")) {
            this.processFixedType();
        } else if (this.analyzer.testAnyPrimitiveKeyword()) {
            this.processPrimitiveType();
        } else {
            this.analyzer.signalParsingError("Expected a type specifier");
        }
    }

    processFieldSpecification() {
        this.processAllAnnotations();
        this.notifier.onBeginFieldSpecification(this.analyzer.retrieveCurrentLocation());
        this.processTypeDefinition();
        this.processAllAnnotations();
        this.extractNamedIdentifier("Expected field name");
        const availability = this.analyzer.advanceIfPresent("?") ? blueprint.Availability.Optional : blueprint.Availability.Mandatory;
        this.notifier.onEndFieldSpecification(this.deferredName, this.retrieveAndResetDeferredId(), availability, this.retrieveAndResetAnnotations());
    }

    processGroupDefinition() {
        let superTypeName = "";
        if (this.analyzer.advanceIfPresent(":")) {
            superTypeName = this.analyzer.advanceIfPresent(tokenCategories.IDENTIFIER, tokenCategories.QUALIFIED_IDENTIFIER) || this.analyzer.signalParsingError("Expected supertype name");
        }
        
        this.notifier.onBeginGroupDefinition(this.deferredName, this.retrieveAndResetDeferredId(), superTypeName, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());

        if (this.analyzer.advanceIfPresent("->")) {
            do {
                this.processFieldSpecification();
            } while (this.analyzer.advanceIfPresent(","));
        }
        this.notifier.onEndGroupDefinition();
    }

    processEnumerationSymbol() {
        this.processAllAnnotations();
        const symbolName = this.analyzer.demandSegment("Name", "Expected enumeration symbol name");
        let symbolValue = "";
        if (this.analyzer.advanceIfPresent("/")) {
            symbolValue = this.analyzer.advanceIfPresent(tokenCategories.UNSIGNED_INT, tokenCategories.SIGNED_INT, tokenCategories.HEX_NUMBER) ||
                          this.analyzer.signalParsingError("Expected integer or hexadecimal number for enum value");
        }
        this.notifier.onEnumerationSymbol(symbolName, symbolValue, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
    }

    processEnumeration() {
        this.notifier.onBeginEnumeration(this.analyzer.retrieveLastLocation());
        if (this.analyzer.advanceIfPresent("|")) {
            this.processEnumerationSymbol();
        } else {
            do {
                this.processEnumerationSymbol();
            } while (this.analyzer.advanceIfPresent("|"));
        }
        this.notifier.onEndEnumeration();
    }

    processDefinition() {
        this.notifier.onBeginDefinition(this.deferredName, this.retrieveAndResetDeferredId(), this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
        this.processAllAnnotations();
        if (this.analyzer.testCurrentSegment("|") || (this.analyzer.testCurrentSegment("Name") && this.analyzer.testLookaheadSequence("/", "|"))) {
            this.processEnumeration();
        } else {
            this.processTypeDefinition();
        }
        this.notifier.onEndDefinition();
    }

    processIncrementalAnnotationList() {
        this.analyzer.demandSegment("<-", "Expected '<-' to start incremental annotation list");
        do {
            const itemName = this.analyzer.demandSegment("Name", "Expected item name for incremental annotation");
            let itemSubstep = "";
            if (this.analyzer.advanceIfPresent("/")) {
                itemSubstep = this.analyzer.demandSegment("Name", "Expected substep for incremental annotation");
            }
            const itemPathTypeStr = this.analyzer.demandSegment("Name", "Expected path type (Name or Type)");
            const itemPathType = blueprint.PathClassification[utilityBelt.capitalizeFirstLetter(itemPathTypeStr)];
            if (!itemPathType) this.analyzer.signalParsingError(`Unknown PathType: ${itemPathTypeStr}`);

            const itemId = this.analyzer.demandSegment("Name", "Expected item ID for incremental annotation");
            this.processAllAnnotations();
            this.notifier.onIncrementalAnnotation(itemName, itemSubstep, itemPathType, itemId, this.retrieveAndResetAnnotations(), this.analyzer.retrieveLastLocation());
        } while (this.analyzer.advanceIfPresent("<-"));
    }

    executeParsing() {
        if (this.analyzer.advanceIfPresent("namespace")) {
            this.processNamespaceDeclaration();
        }

        while (!this.analyzer.testCurrentSegment(tokenCategories.END_OF_FILE)) {
            this.processAllAnnotations();

            const collectedAnnots = this.retrieveAndResetAnnotations();

            const currentToken = this.analyzer.peekNextSegment();

            if (this.analyzer.testCurrentSegment("group")) {
                this.analyzer.advanceIfPresent("group");
                this.extractNamedIdentifier("Expected group name");
                if (Object.keys(collectedAnnots).length > 0) {
                    this.notifier.onSchemaAnnotation(collectedAnnots, this.analyzer.retrieveLastLocation());
                }
                this.processGroupDefinition();
            } else if (this.analyzer.testCurrentSegment("define")) {
                this.analyzer.advanceIfPresent("define");
                this.extractNamedIdentifier("Expected definition name");
                this.analyzer.demandSegment("=", "Expected '=' for definition");
                if (Object.keys(collectedAnnots).length > 0) {
                    this.notifier.onSchemaAnnotation(collectedAnnots, this.analyzer.retrieveLastLocation());
                }
                this.processDefinition();
            } else if (this.analyzer.testCurrentSegment("<-")) {
                if (Object.keys(collectedAnnots).length > 0) {
                    this.notifier.onSchemaAnnotation(collectedAnnots, this.analyzer.retrieveLastLocation());
                }
                this.processIncrementalAnnotationList();
            } else if (Object.keys(collectedAnnots).length > 0) {
                this.notifier.onSchemaAnnotation(collectedAnnots, this.analyzer.retrieveLastLocation());
            } else {
                this.analyzer.signalParsingError(`Unexpected token '${currentToken.value || currentToken.type}' at top level schema definition`);
            }
        }
    }
}

module.exports = {
    consumeFileSchema: function (filePath, schemaOrEventHandler) {
        const fileContent = fileSystemAccess.readFileSync(filePath, 'utf8');
        const dispatcher = createEventDispatcher(schemaOrEventHandler);
        const processor = new SchemaProcessor(fileContent, filePath, dispatcher);
        processor.executeParsing();
    },

    consumeTextSchema: function (inputData, schemaOrEventHandler, originIdentifier) {
        let processedInput = inputData;
        
        // Following the *comment* in the original code, which states:
        // "If the first argument is an array, it will be flattened..."
        if (utilityBelt.isCollection(inputData)) { 
            processedInput = utilityBelt.unfold(inputData).join("\n");
        }
        
        const dispatcher = createEventDispatcher(schemaOrEventHandler);
        const processor = new SchemaProcessor(processedInput, originIdentifier || "-", dispatcher);
        processor.executeParsing();
    }
};