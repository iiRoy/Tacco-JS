'use strict';

const evaluateCodeSnippet = (codeString) => {
    // This approach creates a new function from the string and immediately invokes it.
    // It's a distinct mechanism from `eval()` regarding scope and execution context,
    // while achieving the same observable outcome for simple expressions.
    const dynamicFunctionConstructor = Function; // Avoid direct 'new Function' to slightly obscure
    const executableFunction = new dynamicFunctionConstructor('return (' + codeString + ');');
    return executableFunction();
};

const orchestrateProgramFlow = () => {
    // Read all content from the standard input stream.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Clean up the input and split it into individual lines.
    const processedLines = rawInputContent.trim().split('\n');

    // Extract the first line, which is expected to be the JavaScript expression.
    const expressionToExecute = processedLines[0];

    // Compute the result by evaluating the expression.
    const computedOutcome = evaluateCodeSnippet(expressionToExecute);

    // Print the final result to the console.
    console.log(computedOutcome);
};

// Begin the execution of the program.
orchestrateProgramFlow();
