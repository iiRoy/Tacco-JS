const lexicalProcessor = CodeHighlighter;

lexicalProcessor.supplySchema = function(alias, structure) {
    this.addStyle(alias, structure);
};

const categoryMap = {
    "remark": "comment",
    "enclosures": "brackets",
    "textual": "string",
    "directives": "keywords",
    "universal": "global"
};

const classificationRegistry = [];

function registerCategorySchema(internalName, patternSource, isList = false) {
    let compiledExpression;
    if (isList) {
        const patternJoined = patternSource.join('|');
        compiledExpression = new RegExp(`\\b(${patternJoined})\\b`);
    } else {
        compiledExpression = new RegExp(patternSource);
    }
    classificationRegistry.push({
        internalIdentifier: internalName,
        expression: compiledExpression
    });
}

registerCategorySchema("remark", "(/\\/[^\\n]*\\n)|(/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/)", false);
registerCategorySchema("enclosures", "\\(|\\)", false);
registerCategorySchema("textual", "'[^']*'|\"[^\"]*\"", false);
registerCategorySchema("directives", [
    "arguments", "break", "case", "continue", "default", "delete", "do", "else", "false",
    "for", "function", "if", "in", "instanceof", "new", "null", "return", "switch", "this",
    "true", "typeof", "var", "void", "while", "with"
], true);
registerCategorySchema("universal", [
    "toString", "valueOf", "window", "element", "prototype", "constructor", "document",
    "escape", "unescape", "parseInt", "parseFloat", "setTimeout", "clearTimeout",
    "setInterval", "clearInterval", "NaN", "isNaN", "Infinity"
], true);

function assembleFinalSchema(definitions, mapping) {
    const finalSchemaObject = {};
    for (let currentDefinition of definitions) {
        const externalKey = mapping[currentDefinition.internalIdentifier];
        if (externalKey) {
            finalSchemaObject[externalKey] = { exp: currentDefinition.expression };
        }
    }
    return finalSchemaObject;
}

const languageDefinition = assembleFinalSchema(classificationRegistry, categoryMap);

lexicalProcessor.supplySchema("scriptingLanguage", languageDefinition);