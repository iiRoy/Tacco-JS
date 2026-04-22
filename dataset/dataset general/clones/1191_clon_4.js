'use strict';

(function(dep) {
    dep.parserModule = dep.parserModule || {};

    const ClassificationIdentifiers = {
        END_OF_FILE_MARKER: -2,
        LINE_BREAK_MARKER: -1,
        WHITESPACE_BLOCK: 0,
        DIMENSION_UNIT: 1,
        MULTILINE_COMMENT: 2,
        PUNCTUATION_SYMBOL: 3,
        NUMERIC_ENTRY: 4,
        STYLE_PROPERTY_KEY: 5,
        STYLE_PROPERTY_VALUE: 6,
        CSS_ELEMENT_SELECTOR: 7,
        UNRECOGNIZED_ENTITY: 8
    };

    const ExactClassificationNames = {};
    ExactClassificationNames[ClassificationIdentifiers.END_OF_FILE_MARKER] = 'eof';
    ExactClassificationNames[ClassificationIdentifiers.LINE_BREAK_MARKER] = 'eol';
    ExactClassificationNames[ClassificationIdentifiers.WHITESPACE_BLOCK] = 'white';
    ExactClassificationNames[ClassificationIdentifiers.DIMENSION_UNIT] = 'unit';
    ExactClassificationNames[ClassificationIdentifiers.MULTILINE_COMMENT] = 'comment';
    ExactClassificationNames[ClassificationIdentifiers.PUNCTUATION_SYMBOL] = 'simbol';
    ExactClassificationNames[ClassificationIdentifiers.NUMERIC_ENTRY] = 'number';
    ExactClassificationNames[ClassificationIdentifiers.STYLE_PROPERTY_KEY] = 'property';
    ExactClassificationNames[ClassificationIdentifiers.STYLE_PROPERTY_VALUE] = 'value';
    ExactClassificationNames[ClassificationIdentifiers.CSS_ELEMENT_SELECTOR] = 'selector';
    ExactClassificationNames[ClassificationIdentifiers.UNRECOGNIZED_ENTITY] = 'unknown';

    const ProcessingStages = {
        INITIAL_SCANNING: 'initialScanning',
        NUMBER_ACCUMULATION: 'numberAccumulation',
        COMMENT_TEXT_COLLECTION: 'commentTextCollection',
        COMMENT_END_SEQUENCE_CHECK: 'commentEndSequenceCheck',
        SELECTOR_IDENTIFICATION: 'selectorIdentification',
        AFTER_PROPERTY_IDENTIFIER_READ: 'afterPropertyIdentifierRead',
        PROPERTY_IDENTIFIER_ACCUMULATION: 'propertyIdentifierAccumulation',
        DOUBLE_QUOTE_STRING_LITERAL: 'doubleQuoteStringLiteral',
        SINGLE_QUOTE_STRING_LITERAL: 'singleQuoteStringLiteral',
        PARENTHESIS_EXPRESSION_GROUP: 'parenthesisExpressionGroup',
        CURLY_BRACE_BLOCK: 'curlyBraceBlock',
        WHITESPACE_ACCUMULATION: 'whitespaceAccumulation',
        PROPERTY_VALUE_EXPRESSION_REGION: 'propertyValueExpressionRegion',
        PROPERTY_VALUE_COMPONENT_IDENTIFICATION: 'propertyValueComponentIdentification',
        UNIT_IDENTIFICATION: 'unitIdentification',
        PROCESSING_COMPLETE: 'processingComplete'
    };

    function ContextualStateTracker(startingStage) {
        let stageStack = [startingStage];

        this.pushStage = (stage) => stageStack.push(stage);
        this.transitionStage = (stage) => {
            stageStack.pop();
            stageStack.push(stage);
        };
        this.popStage = () => stageStack.pop();
        this.currentStage = () => stageStack[stageStack.length - 1];
        this.popStagesUntil = (targetStage) => {
            while (this.popStage() !== targetStage) {}
        };
    }

    const performLexicalAnalysis = function (inputSource, configOptions) {
        let parsedFragments = [];
        let currentFragmentBuffer = '';
        let nextFragmentClassification = null;
        let includeCharInFragment = true;
        let characterValue = '';

        const stateMachine = new ContextualStateTracker(ProcessingStages.INITIAL_SCANNING);
        const tabSpaceReplacement = (function() {
            let spacesString = '';
            const configuredSpacesPerTab = configOptions && configOptions.tabSpace !== undefined ? configOptions.tabSpace : 4;
            for (let i = 0; i < configuredSpacesPerTab; i++) {
                spacesString += ' ';
            }
            return spacesString;
        })();

        const recordFragment = (classification) => {
            parsedFragments.push({ content: currentFragmentBuffer, kind: classification });
            nextFragmentClassification = null;
            currentFragmentBuffer = '';
        };

        const indicateNextClassification = (classification) => {
            nextFragmentClassification = classification;
        };

        const returnSourceChar = () => {
            inputSource.putBack();
            includeCharInFragment = false;
        };

        while (stateMachine.currentStage() !== ProcessingStages.PROCESSING_COMPLETE) {
            characterValue = inputSource.read();
            includeCharInFragment = true;

            switch (stateMachine.currentStage()) {
                case ProcessingStages.INITIAL_SCANNING:
                    if (dep.type.isAlpha(characterValue) || characterValue === '.' || characterValue === '#' || characterValue === '*' || characterValue === '$' || characterValue === ':') {
                        stateMachine.pushStage(ProcessingStages.SELECTOR_IDENTIFICATION);
                    } else if (dep.type.isWhite(characterValue)) {
                        stateMachine.pushStage(ProcessingStages.WHITESPACE_ACCUMULATION);
                    } else if (characterValue === ',' || characterValue === '[' || characterValue === ']' || characterValue === '>') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (characterValue === '{'){
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.pushStage(ProcessingStages.CURLY_BRACE_BLOCK);
                    } else if (characterValue === dep.Stream.EOL) {
                        indicateNextClassification(ClassificationIdentifiers.LINE_BREAK_MARKER);
                    } else if (characterValue === dep.Stream.EOF) {
                        returnSourceChar();
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                    } else if (characterValue === '/') {
                        if (inputSource.pick() === '*') {
                            stateMachine.pushStage(ProcessingStages.COMMENT_TEXT_COLLECTION);
                            currentFragmentBuffer += characterValue;
                            characterValue = inputSource.read();
                        } else {
                            indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                        }
                    } else {
                        indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                    }
                    break;

                case ProcessingStages.WHITESPACE_ACCUMULATION:
                    if (!dep.type.isWhite(characterValue) ) {
                        returnSourceChar();
                        indicateNextClassification(ClassificationIdentifiers.WHITESPACE_BLOCK);
                        stateMachine.popStage();
                    }
                    break;

                case ProcessingStages.SELECTOR_IDENTIFICATION:
                    if (!dep.type.isAlpha(characterValue) && !dep.type.isNum(characterValue) && characterValue !== '-') {
                        returnSourceChar();
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.CSS_ELEMENT_SELECTOR);
                    }
                    break;

                case ProcessingStages.CURLY_BRACE_BLOCK:
                    if (characterValue === '}') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (dep.type.isWhite(characterValue)) {
                        stateMachine.pushStage(ProcessingStages.WHITESPACE_ACCUMULATION);
                    } else if (dep.type.isAlpha(characterValue) || characterValue === '-') {
                        stateMachine.pushStage(ProcessingStages.PROPERTY_IDENTIFIER_ACCUMULATION);
                    } else if (characterValue === '/') {
                        if (inputSource.pick() === '*') {
                            stateMachine.pushStage(ProcessingStages.COMMENT_TEXT_COLLECTION);
                            currentFragmentBuffer += characterValue;
                            characterValue = inputSource.read();
                        } else {
                            indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                        }
                    } else if (characterValue === dep.Stream.EOL) {
                        indicateNextClassification(ClassificationIdentifiers.LINE_BREAK_MARKER);
                    } else if (characterValue === dep.Stream.EOF) {
                        returnSourceChar();
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                    } else {
                        indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                    }
                    break;

                case ProcessingStages.PROPERTY_IDENTIFIER_ACCUMULATION:
                    if (dep.type.isAlpha(characterValue) || characterValue === '-') {
                        // Continue accumulating
                    } else {
                        returnSourceChar();
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_KEY);
                        stateMachine.transitionStage(ProcessingStages.AFTER_PROPERTY_IDENTIFIER_READ);
                    }
                    break;

                case ProcessingStages.AFTER_PROPERTY_IDENTIFIER_READ:
                    if (dep.type.isWhite(characterValue)) {
                        stateMachine.pushStage(ProcessingStages.WHITESPACE_ACCUMULATION);
                    } else if (characterValue === ':') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.transitionStage(ProcessingStages.PROPERTY_VALUE_EXPRESSION_REGION);
                    } else if (characterValue === '/') {
                        if (inputSource.pick() === '*') {
                            stateMachine.pushStage(ProcessingStages.COMMENT_TEXT_COLLECTION);
                            currentFragmentBuffer += characterValue;
                            characterValue = inputSource.read();
                        } else {
                            indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                        }
                    } else if (characterValue === ';') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (characterValue === '}') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.popStagesUntil(ProcessingStages.CURLY_BRACE_BLOCK);
                    } else {
                        indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                    }
                    break;

                case ProcessingStages.PROPERTY_VALUE_EXPRESSION_REGION:
                    if (dep.type.isWhite(characterValue)) {
                        stateMachine.pushStage(ProcessingStages.WHITESPACE_ACCUMULATION);
                    } else if (characterValue === ';') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (dep.type.isNum(characterValue) || characterValue === '.') {
                        stateMachine.pushStage(ProcessingStages.NUMBER_ACCUMULATION);
                    } else if (dep.type.isAlpha(characterValue) || characterValue === '#') {
                        stateMachine.pushStage(ProcessingStages.PROPERTY_VALUE_COMPONENT_IDENTIFICATION);
                    } else if (characterValue === '}') {
                        stateMachine.popStagesUntil(ProcessingStages.CURLY_BRACE_BLOCK);
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (characterValue === '/') {
                        if (inputSource.pick() === '*') {
                            stateMachine.pushStage(ProcessingStages.COMMENT_TEXT_COLLECTION);
                            currentFragmentBuffer += characterValue;
                            characterValue = inputSource.read();
                        } else {
                            indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                        }
                    } else if (characterValue === '('){
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.pushStage(ProcessingStages.PARENTHESIS_EXPRESSION_GROUP);
                    } else if (characterValue === '\''){
                        stateMachine.pushStage(ProcessingStages.SINGLE_QUOTE_STRING_LITERAL);
                    } else if (characterValue === '"'){
                        stateMachine.pushStage(ProcessingStages.DOUBLE_QUOTE_STRING_LITERAL);
                    } else if (characterValue === '!'){
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (characterValue === dep.Stream.EOF) {
                        returnSourceChar();
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                    } else {
                        indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                    }
                    break;

                case ProcessingStages.PROPERTY_VALUE_COMPONENT_IDENTIFICATION:
                    if (!dep.type.isAlpha(characterValue) && characterValue !== '-') {
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_VALUE);
                        returnSourceChar();
                        stateMachine.popStage();
                    }
                    break;

                case ProcessingStages.PARENTHESIS_EXPRESSION_GROUP:
                    if (dep.type.isNum(characterValue) || characterValue === '.') {
                        stateMachine.pushStage(ProcessingStages.NUMBER_ACCUMULATION);
                    } else if (characterValue === ',') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                    } else if (characterValue === ')') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.popStage();
                    } else if (dep.type.isAlpha(characterValue) || characterValue === '#'){
                        returnSourceChar();
                        stateMachine.pushStage(ProcessingStages.PROPERTY_VALUE_COMPONENT_IDENTIFICATION);
                    } else if (characterValue === '\''){
                        stateMachine.pushStage(ProcessingStages.SINGLE_QUOTE_STRING_LITERAL);
                    } else if (characterValue === '"'){
                        stateMachine.pushStage(ProcessingStages.DOUBLE_QUOTE_STRING_LITERAL);
                    } else if (characterValue === dep.Stream.EOL) {
                        indicateNextClassification(ClassificationIdentifiers.LINE_BREAK_MARKER);
                    } else if (characterValue === '}') {
                        indicateNextClassification(ClassificationIdentifiers.PUNCTUATION_SYMBOL);
                        stateMachine.popStagesUntil(ProcessingStages.CURLY_BRACE_BLOCK);
                    } else if (dep.type.isWhite(characterValue)) {
                        stateMachine.pushStage(ProcessingStages.WHITESPACE_ACCUMULATION);
                    } else if (characterValue === dep.Stream.EOF) {
                        returnSourceChar();
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                    } else {
                        indicateNextClassification(ClassificationIdentifiers.UNRECOGNIZED_ENTITY);
                    }
                    break;

                case ProcessingStages.NUMBER_ACCUMULATION:
                    if (!dep.type.isNum(characterValue) && characterValue !== '.') {
                        if (dep.type.isAlpha(characterValue) || characterValue === '%') {
                            stateMachine.transitionStage(ProcessingStages.UNIT_IDENTIFICATION);
                        } else {
                            stateMachine.popStage();
                        }
                        returnSourceChar();
                        indicateNextClassification(ClassificationIdentifiers.NUMERIC_ENTRY);
                    }
                    break;

                case ProcessingStages.UNIT_IDENTIFICATION:
                    if (!dep.type.isAlpha(characterValue)) {
                        stateMachine.popStage();
                        returnSourceChar();
                        indicateNextClassification(ClassificationIdentifiers.DIMENSION_UNIT);
                    }
                    break;

                case ProcessingStages.SINGLE_QUOTE_STRING_LITERAL:
                    if (characterValue === '\'') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_VALUE);
                    } else if (characterValue === dep.Stream.EOL){
                        indicateNextClassification(ClassificationIdentifiers.LINE_BREAK_MARKER);
                    } else if (characterValue === dep.Stream.EOF) {
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_VALUE);
                        returnSourceChar();
                    }
                    break;

                case ProcessingStages.DOUBLE_QUOTE_STRING_LITERAL:
                    if (characterValue === '"') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_VALUE);
                    } else if (characterValue === dep.Stream.EOL){
                        characterValue = '\n';
                    } else if (characterValue === dep.Stream.EOF) {
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                        indicateNextClassification(ClassificationIdentifiers.STYLE_PROPERTY_VALUE);
                        returnSourceChar();
                    }
                    break;

                case ProcessingStages.COMMENT_TEXT_COLLECTION:
                    if (characterValue === '*') {
                        if (inputSource.pick() === '/') {
                            stateMachine.transitionStage(ProcessingStages.COMMENT_END_SEQUENCE_CHECK);
                            returnSourceChar();
                        }
                    } else if (characterValue === dep.Stream.EOF) {
                        stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
                        returnSourceChar();
                        indicateNextClassification(ClassificationIdentifiers.MULTILINE_COMMENT);
                    }
                    break;

                case ProcessingStages.COMMENT_END_SEQUENCE_CHECK:
                    if (characterValue === '/') {
                        stateMachine.popStage();
                        indicateNextClassification(ClassificationIdentifiers.MULTILINE_COMMENT);
                    }
                    break;

                default :
                    stateMachine.transitionStage(ProcessingStages.PROCESSING_COMPLETE);
            }

            if (includeCharInFragment) {
                if (characterValue === '\t') {
                    currentFragmentBuffer += tabSpaceReplacement;
                } else if (characterValue !== dep.Stream.EOF) {
                    currentFragmentBuffer += characterValue;
                }
            }

            if (nextFragmentClassification !== null) {
                recordFragment(nextFragmentClassification);
                if (parsedFragments.length > 100000) {
                    break;
                }
            }
            if (currentFragmentBuffer.length > 2000) {
                break;
            }
        }

        return parsedFragments;
    };

    dep.parserModule['cssSyntacticAnalyzer'] = {
        analyze: performLexicalAnalysis,
        classificationMap: ExactClassificationNames
    };

}(lighter));