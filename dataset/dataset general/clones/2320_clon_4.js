const inputData = 'div {$color: nani}';
const formatType = 'scss';

const syntaxProcessor = require('./../lib/gonzales');

const createIndenter = (indentStep = 2, indentChar = ' ') => {
    const indentationCache = [''];
    return (level) => {
        if (indentationCache[level] === undefined) {
            for (let i = indentationCache.length; i <= level; i++) {
                indentationCache[i] = indentChar.repeat(i * indentStep);
            }
        }
        return indentationCache[level];
    };
};

const obtainIndentation = createIndenter(2);

const visualizeSyntaxTree = (currentNode, currentDepth = 0) => {
    let resultString = '';

    if (!Array.isArray(currentNode)) {
        resultString = `'${String(currentNode)}'`;
    } else {
        const childRepresentations = [];
        currentNode.forEach(childElement => {
            if (Array.isArray(childElement)) {
                childRepresentations.push(visualizeSyntaxTree(childElement, currentDepth + 1));
            } else {
                childRepresentations.push(`'${String(childElement)}'`);
            }
        });

        const joinedChildren = childRepresentations.join(', ');
        resultString = `[${joinedChildren}]`;
    }

    if (currentDepth > 0) {
        return '\n' + obtainIndentation(currentDepth) + resultString;
    } else {
        return resultString;
    }
};

(function performSyntaxOperations() {
    const cssSourceContent = inputData;
    const syntaxDialect = formatType;

    const generatedAst = syntaxProcessor.cssToAST({ css: cssSourceContent, syntax: syntaxDialect });

    console.log('\n== Source text:');
    console.log(cssSourceContent);

    console.log('\n== Structure Output:');
    console.log(visualizeSyntaxTree(generatedAst));

    console.log('\n== Reconstructed Text:');
    console.log(syntaxProcessor.astToCSS({ ast: generatedAst, syntax: syntaxDialect }));
})();