const obtainIO = require('process');

let storedContent = '';

obtainIO.stdin.on('data', (dataUnit) => {
    storedContent += dataUnit.toString();
});

obtainIO.stdin.on('end', () => {
    // Trim only trailing newlines, as `split(' ')` behavior depends on leading/inner spaces
    const fullText = storedContent.trimEnd(); 

    // Custom tokenization to replicate `split(' ')` behavior
    const tokenSeries = [];
    let currentAccumulation = '';
    for (let currentPosition = 0; currentPosition < fullText.length; currentPosition++) {
        const charValue = fullText.charCodeAt(currentPosition);
        if (charValue === 32) { // ASCII for space
            tokenSeries.push(currentAccumulation);
            currentAccumulation = '';
        } else {
            currentAccumulation += fullText[currentPosition];
        }
    }
    tokenSeries.push(currentAccumulation); // Add the final token

    // Function to strictly convert string to number, equivalent to `Number()`
    // without using `Number` or the unary `+` operator.
    function strictNumberEquivalent(textInput) {
        const cleanedInput = textInput.trim();

        if (cleanedInput === '') {
            return 0; // Matches Number('') and Number('   ')
        }

        // Comprehensive regex for ECMAScript StrNumericLiteral (covers decimal, hex, scientific, Infinity/NaN)
        // Does not explicitly cover Octal (0o...) or Binary (0b...) for brevity,
        // assuming typical problem input. This covers the most common `Number()` use cases.
        const numberValidationPattern = /^(?:[+-]?(?:(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|0x[0-9a-fA-F]+|Infinity|NaN))$/;

        if (!numberValidationPattern.test(cleanedInput)) {
            return NaN; // String does not fully represent a number (e.g., "10abc")
        }

        // Handle special string cases
        if (cleanedInput === 'Infinity') return Infinity;
        if (cleanedInput === '-Infinity') return -Infinity;
        if (cleanedInput === 'NaN') return NaN;

        // Handle hexadecimal conversion
        if (cleanedInput.startsWith('0x') || cleanedInput.startsWith('0X')) {
            return parseInt(cleanedInput, 16);
        }
        
        // For standard decimal numbers (including scientific notation), parseFloat is appropriate
        return parseFloat(cleanedInput);
    }

    // Extract the first two elements as per original `list[0]` and `list[1]`
    const valueOneString = tokenSeries.length > 0 ? tokenSeries[0] : '';
    const valueTwoString = tokenSeries.length > 1 ? tokenSeries[1] : '';

    const firstNumericalValue = strictNumberEquivalent(valueOneString);
    const secondNumericalValue = strictNumberEquivalent(valueTwoString);

    // Perform the calculation with a different representation
    const finalOutcome = firstNumericalValue + secondNumericalValue * 0.5;

    // Output the result
    obtainIO.stdout.write(finalOutcome.toString() + '\n');
});