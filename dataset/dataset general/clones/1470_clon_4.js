const makeParsingFunction = (parsingLogic) => (textToParse, currentPosition) => parsingLogic(textToParse, currentPosition);

const characterMatch = (specificChar) => makeParsingFunction((textToParse, currentPosition) => {
    if (currentPosition < textToParse.length && textToParse.charAt(currentPosition) === specificChar) {
        return { content: specificChar, nextPosition: currentPosition + 1 };
    }
    return null;
});

const stringMatch = (targetString) => makeParsingFunction((textToParse, currentPosition) => {
    if (textToParse.substring(currentPosition, currentPosition + targetString.length) === targetString) {
        return { content: targetString, nextPosition: currentPosition + targetString.length };
    }
    return null;
});

const anyCharacter = makeParsingFunction((textToParse, currentPosition) => {
    if (currentPosition < textToParse.length) {
        return { content: textToParse.charAt(currentPosition), nextPosition: currentPosition + 1 };
    }
    return null;
});

const sequenceOfParsers = (...parsers) => makeParsingFunction((textToParse, currentPosition) => {
    let tempPosition = currentPosition;
    const collectedContents = [];
    for (const parser of parsers) {
        const result = parser(textToParse, tempPosition);
        if (!result) return null;
        collectedContents.push(result.content);
        tempPosition = result.nextPosition;
    }
    return { content: collectedContents, nextPosition: tempPosition };
});

const choiceOfParsers = (...parsers) => makeParsingFunction((textToParse, currentPosition) => {
    for (const parser of parsers) {
        const result = parser(textToParse, currentPosition);
        if (result) return result;
    }
    return null;
});

const transformResult = (parser, transformation) => makeParsingFunction((textToParse, currentPosition) => {
    const result = parser(textToParse, currentPosition);
    if (result) {
        return { content: transformation(result.content), nextPosition: result.nextPosition };
    }
    return null;
});

const zeroOrMore = (parser) => makeParsingFunction((textToParse, currentPosition) => {
    let tempPosition = currentPosition;
    const collectedContents = [];
    let result;
    while ((result = parser(textToParse, tempPosition))) {
        collectedContents.push(result.content);
        tempPosition = result.nextPosition;
    }
    return { content: collectedContents, nextPosition: tempPosition };
});

const oneOrMore = (parser) => transformResult(sequenceOfParsers(parser, zeroOrMore(parser)), ([first, rest]) => [first, ...rest]);

const optionalParse = (parser) => makeParsingFunction((textToParse, currentPosition) => {
    const result = parser(textToParse, currentPosition);
    return result || { content: null, nextPosition: currentPosition };
});

const negativeLookahead = (parser) => makeParsingFunction((textToParse, currentPosition) => {
    const result = parser(textToParse, currentPosition);
    return result ? null : { content: null, nextPosition: currentPosition };
});

const delayedParser = (parserCreatorFunction) => {
    let actualParser = null;
    return makeParsingFunction((textToParse, currentPosition) => {
        if (!actualParser) {
            actualParser = parserCreatorFunction();
        }
        return actualParser(textToParse, currentPosition);
    });
};

const compileParts = (parts) => parts.filter(p => p !== null && p !== undefined).join('');

const generatedParserUtilities = compileParts([
    `function parse_char(input, pos) {\n`,
    `  if (pos >= input.length) return null;\n`,
    `  return { pos: pos + 1, val: input.charAt(pos) };\n`,
    `}\n`,
    `function literal(input, pos, string) {\n`,
    `  if (input.substring(pos, pos + string.length) === string) {\n`,
    `    return { pos: pos + string.length, val: string };\n`,
    `  } else return null;\n`,
    `}\n`,
    `if (typeof exports !== 'undefined')\n`,
    `    exports.parse_sentence = parse_sentence;\n`
]);

let spaceCharacterRule, whitespaceRule;
let metaCharacterRule;
let identifierCharacterRule, identifierRule;
let singleQuotedContentRule, singleQuotedLiteralRule;
let ruleInvocationRule, labeledExpressionRule, negatedExpressionRule, parenthesizedExpressionRule;
let generalExpressionRule, resultExpressionRule, expressionSequenceRule, alternativeRule;
let grammarDefinitionRule, grammarEntryRule;

spaceCharacterRule = choiceOfParsers(characterMatch(' '), characterMatch('\n'), characterMatch('\t'));
whitespaceRule = zeroOrMore(spaceCharacterRule);

metaCharacterRule = choiceOfParsers(
    stringMatch('!'), stringMatch('\''), stringMatch('<-'), stringMatch('/'),
    stringMatch('.'), stringMatch('('), stringMatch(')'), stringMatch(':'),
    stringMatch('->')
);

identifierCharacterRule = transformResult(sequenceOfParsers(
    negativeLookahead(metaCharacterRule),
    negativeLookahead(spaceCharacterRule),
    anyCharacter
), ([_m, _s, char]) => char);

identifierRule = transformResult(oneOrMore(identifierCharacterRule), (chars) => chars.join(''));

const nonSpecialChar = transformResult(sequenceOfParsers(
    negativeLookahead(characterMatch('\\')),
    negativeLookahead(characterMatch('\'')),
    anyCharacter
), ([_1, _2, char]) => char);

const escapedChar = transformResult(sequenceOfParsers(
    characterMatch('\\'),
    anyCharacter
), ([backslash, char]) => backslash + char);

singleQuotedContentRule = delayedParser(() => choiceOfParsers(
    transformResult(sequenceOfParsers(nonSpecialChar, optionalParse(singleQuotedContentRule)), ([char, rest]) => char + (rest || '')),
    transformResult(sequenceOfParsers(escapedChar, optionalParse(singleQuotedContentRule)), ([char, rest]) => char + (rest || '')),
    transformResult(sequenceOfParsers(), () => '')
));

singleQuotedLiteralRule = transformResult(
    sequenceOfParsers(
        characterMatch('\''),
        singleQuotedContentRule,
        characterMatch('\''),
        whitespaceRule
    ),
    ([_q1, content, _q2, _ws]) => `  state = literal(input, state.pos, '${content}');\n`
);

ruleInvocationRule = transformResult(
    sequenceOfParsers(identifierRule, whitespaceRule),
    ([name, _ws]) => `  state = parse_${name}(input, state.pos);\n`
);

resultExpressionRule = transformResult(
    sequenceOfParsers(
        stringMatch('->'),
        whitespaceRule,
        zeroOrMore(transformResult(sequenceOfParsers(negativeLookahead(characterMatch('.')), anyCharacter), ([_nl, char]) => char)),
        characterMatch('.')
    ),
    ([_arrow, _ws1, chars, _dot]) => {
        const expression = chars.join('').trim();
        return `  if (state) state.val = ${expression};\n`;
    }
);

expressionSequenceRule = delayedParser(() => {
    const recursiveSequenceBranch = transformResult(
        sequenceOfParsers(generalExpressionRule, optionalParse(expressionSequenceRule)),
        ([exprCode, nestedSequenceCode]) => {
            if (nestedSequenceCode) {
                return compileParts([exprCode, `  if (state) {\n`, nestedSequenceCode, `  }\n`]);
            }
            return exprCode;
        }
    );
    return choiceOfParsers(recursiveSequenceBranch, resultExpressionRule, transformResult(sequenceOfParsers(), () => ''));
});

alternativeRule = delayedParser(() => {
    const mainAlternativeBranch = transformResult(
        sequenceOfParsers(
            expressionSequenceRule,
            optionalParse(
                sequenceOfParsers(
                    characterMatch('/'),
                    whitespaceRule,
                    alternativeRule
                )
            )
        ),
        ([firstSequenceCode, optionalAlt]) => {
            if (optionalAlt) {
                const [_slash, _ws, subsequentAltCode] = optionalAlt;
                return compileParts([
                    `  stack.push(state);\n`,
                    firstSequenceCode,
                    `  if (!state) {\n`,
                    `    state = stack.pop();\n`,
                    subsequentAltCode,
                    `  } else stack.pop();\n`
                ]);
            }
            return firstSequenceCode;
        }
    );
    return mainAlternativeBranch;
});

parenthesizedExpressionRule = transformResult(
    sequenceOfParsers(
        characterMatch('('),
        whitespaceRule,
        alternativeRule,
        whitespaceRule,
        characterMatch(')')
    ),
    ([_lp, _ws1, choiceCode, _ws2, _rp]) => choiceCode
);

negatedExpressionRule = transformResult(
    sequenceOfParsers(
        characterMatch('!'),
        whitespaceRule,
        generalExpressionRule
    ),
    ([_bang, _ws, termCode]) => {
        return compileParts([
            `  stack.push(state);\n`,
            termCode,
            `  if (state) {\n`,
            `    stack.pop();\n`,
            `    state = null;\n`,
            `  } else {\n`,
            `    state = stack.pop();\n`,
            `  }\n`
        ]);
    }
);

labeledExpressionRule = transformResult(
    sequenceOfParsers(
        identifierRule,
        whitespaceRule,
        characterMatch(':'),
        whitespaceRule,
        generalExpressionRule
    ),
    ([label, _ws1, _colon, _ws2, valueCode]) => {
        return compileParts([valueCode, `  if (state) var ${label} = state.val;\n`]);
    }
);

generalExpressionRule = delayedParser(() => choiceOfParsers(
    labeledExpressionRule,
    ruleInvocationRule,
    singleQuotedLiteralRule,
    negatedExpressionRule,
    parenthesizedExpressionRule
));

grammarDefinitionRule = transformResult(
    sequenceOfParsers(
        identifierRule,
        whitespaceRule,
        stringMatch('<-'),
        whitespaceRule,
        alternativeRule,
        whitespaceRule,
        characterMatch('.'),
        whitespaceRule
    ),
    ([name, _ws1, _arrow, _ws2, bodyCode, _ws3, _dot, _ws4]) => {
        return compileParts([
            `function parse_${name}(input, pos) {\n`,
            `  var state = { pos: pos };\n`,
            `  var stack = [];\n`,
            bodyCode,
            `  return state;\n`,
            `}\n`
        ]);
    }
);

grammarEntryRule = delayedParser(() => {
    const recursiveGrammarBranch = transformResult(
        sequenceOfParsers(
            whitespaceRule,
            grammarDefinitionRule,
            grammarEntryRule
        ),
        ([_ws1, ruleCode, subsequentGrammarCode]) => compileParts([ruleCode, `\n`, subsequentGrammarCode])
    );

    const baseGrammarBranch = transformResult(
        sequenceOfParsers(
            whitespaceRule,
            grammarDefinitionRule
        ),
        ([_ws1, ruleCode]) => compileParts([ruleCode, `\n`, generatedParserUtilities])
    );

    return choiceOfParsers(recursiveGrammarBranch, baseGrammarBranch);
});

const generateGrammar = (grammarSourceText) => {
    const parsingResult = grammarEntryRule(grammarSourceText, 0);
    if (parsingResult && parsingResult.nextPosition === grammarSourceText.length) {
        return parsingResult.content;
    }
    return null;
};

// This function is the entry point for the "cloned" parser.
// It corresponds to the original `parse_sentence` function.
// It takes the grammar definition as input and returns the generated parser code.
function buildParser(text, startPos) {
    // The original `parse_sentence` produces the entire parser code.
    // My `generateGrammar` function does that.
    const result = generateGrammar(text);
    if (result) {
        // The original `parse_sentence` returns a state object.
        // For compatibility, let's wrap the generated code.
        // Assuming the original `parse_sentence` is expected to return { pos: newPos, val: generatedCode }
        // The `generateGrammar` already ensures the entire input is consumed.
        return { pos: text.length, val: result };
    }
    return null;
}