// This script provides a simple environment for inspecting the Abstract Syntax Tree (AST)
// generated from a CSS-like string. It's designed for quick debugging and visualization
// of how a stylesheet fragment is parsed and then re-serialized.
//
// To utilize this utility:
// 1. Update the `sourceStylesheetContent` variable with your desired CSS/SCSS/LESS string.
// 2. Adjust `parsingDialect` to match the syntax of your content (e.g., 'css', 'scss', 'less').
// 3. Ensure the path to the `syntaxProcessingModule` correctly points to your parser library.
// 4. Run the script using Node.js.

const sourceStylesheetContent = 'p { /* important comment */ color: #333; font-size: 1.2em; }'; // The raw stylesheet text for parsing.
const parsingDialect = 'scss'; // Specifies the language grammar for the parser (e.g., 'css', 'less', 'scss').
const syntaxProcessingModule = require('./../lib/gonzales'); // Imports the external library responsible for AST operations.

/**
 * Generates a string of whitespace characters for visual indentation.
 * This helps in creating a hierarchical display of the AST structure.
 * @param {number} depthValue - The current depth level, determining the amount of indentation.
 * @returns {string} A string of spaces to be used as a prefix for indented lines.
 */
function produceIndentationString(depthValue) {
    const INDENT_SPACES_PER_LEVEL = '  '; // Defines the indentation unit.
    // Ensure depthValue is a valid non-negative number before repeating.
    if (typeof depthValue !== 'number' || depthValue < 0 || !Number.isInteger(depthValue)) {
        return '';
    }
    return INDENT_SPACES_PER_LEVEL.repeat(depthValue);
}

/**
 * Recursively converts an Abstract Syntax Tree (AST) node or array of nodes into a pretty-printed string.
 * It aims to visualize the nested structure of the AST in a readable, array-like format.
 * @param {Array<any>|object|string|number|boolean|null|undefined} nodeStructure - The AST element to serialize.
 * @param {number} [currentNestingLevel=0] - The current depth in the tree, influencing indentation.
 * @returns {string} A formatted string representation of the given AST fragment.
 */
const serializeSyntaxTree = (nodeStructure, currentNestingLevel = 0) => {
    const indentationForCurrentLevel = produceIndentationString(currentNestingLevel);
    const elementsForOutput = [];

    // Handle primitive values directly as leaf nodes.
    if (nodeStructure === null || nodeStructure === undefined ||
        typeof nodeStructure !== 'object') {
        return `'${String(nodeStructure)}'`;
    }

    // Process array nodes by iterating over their elements.
    if (Array.isArray(nodeStructure)) {
        for (const elementWithinArray of nodeStructure) {
            // Recursively serialize each element.
            elementsForOutput.push(serializeSyntaxTree(elementWithinArray, currentNestingLevel + 1));
        }
    } else {
        // For non-array objects, assume it's a single AST node and try to stringify it.
        // This mimics original behavior for objects that aren't arrays but are part of the 'tree'.
        // We'll skip internal metadata like line numbers for a cleaner output, if applicable.
        // The `toString()` method on Gonzales nodes usually provides a useful representation.
        elementsForOutput.push(`'${nodeStructure.toString()}'`);
    }

    // If no elements were collected, return an empty array representation.
    if (elementsForOutput.length === 0) {
        return (currentNestingLevel > 0 ? `\n${indentationForCurrentLevel}` : '') + '[]';
    }

    // Construct the final string, ensuring proper indentation and array-like formatting.
    const joinedElements = elementsForOutput.join(', ');
    const openingBracket = (currentNestingLevel > 0 ? `\n${indentationForCurrentLevel}` : '') + '[';
    const closingBracket = (currentNestingLevel > 0 ? `\n${indentationForCurrentLevel}` : '') + ']';

    return `${openingBracket}${joinedElements}${closingBracket}`;
};

// --- Main Execution Block ---

// Validate that the essential parsing function exists in the loaded module.
if (!syntaxProcessingModule || typeof syntaxProcessingModule.cssToAST !== 'function') {
    console.error('ERROR: The required syntax processing module or its `cssToAST` method is not available.');
    process.exit(1); // Terminate execution due to critical dependency failure.
}

let generatedAbstractSyntaxTree;
try {
    // Attempt to parse the stylesheet content into an AST.
    // Parameters are encapsulated in an object for clarity.
    const parsingConfiguration = {
        css: sourceStylesheetContent,
        syntax: parsingDialect
    };
    generatedAbstractSyntaxTree = syntaxProcessingModule.cssToAST(parsingConfiguration);
} catch (parserException) {
    console.error(`\n!!! FATAL PARSING ERROR for '${parsingDialect}' content:`);
    console.error(`Message: ${parserException.message}`);
    process.exit(1); // Exit if parsing fails.
}

// Output the original stylesheet content for comparison.
console.log('\n--- Original Stylesheet Content ---');
console.log(sourceStylesheetContent);

// Display the structure of the generated Abstract Syntax Tree.
console.log('\n--- Visualized Abstract Syntax Tree (AST) ---');
// Provide a fallback message if the AST generation resulted in an empty or invalid structure.
if (!generatedAbstractSyntaxTree || (Array.isArray(generatedAbstractSyntaxTree) && generatedAbstractSyntaxTree.length === 0)) {
    console.log('[ The AST appears to be empty or malformed. ]');
} else {
    // Use the custom serialization function to print the AST.
    console.log(serializeSyntaxTree(generatedAbstractSyntaxTree, 0));
}

// Attempt to re-translate the AST back into a CSS string.
console.log('\n--- Re-translated Stylesheet from AST ---');
// Verify the presence of the AST-to-CSS translation function.
if (typeof syntaxProcessingModule.astToCSS === 'function') {
    try {
        const translationConfiguration = {
            ast: generatedAbstractSyntaxTree,
            syntax: parsingDialect
        };
        const reTranslatedStylesheet = syntaxProcessingModule.astToCSS(translationConfiguration);
        console.log(reTranslatedStylesheet);
    } catch (translationException) {
        console.error(`\n!!! ERROR during AST to CSS re-translation:`);
        console.error(`Message: ${translationException.message}`);
    }
} else {
    console.log('[ The `astToCSS` translation function is not provided by the module. ]');
}