const processValue = (inputSymbol) => {
    const digitSequence = [...inputSymbol];
    const numericTokens = digitSequence.map(Number);

    const tokenCount = numericTokens.length;
    const initialToken = numericTokens[0];

    // Get the second digit if it exists, otherwise use a sentinel value
    const subsequentToken = tokenCount > 1 ? numericTokens[1] : -1;

    // Calculate a unique discriminant value to select the appropriate logic path.
    // 0: Default case (length > 2 or (length == 2 and second_digit != 9))
    // 1: Length is 1
    // 2: Length is 2 and second_digit is 9
    const discriminantValue = ((tokenCount === 1) ? 1 : 0) + ((tokenCount === 2 && subsequentToken === 9) ? 2 : 0);

    // Define the different computation paths as an array of functions.
    // The index corresponds to the discriminantValue.
    const computationPaths = [
        () => (tokenCount - 1) * 9 + initialToken - 1, // Path for discriminant 0 (default)
        () => initialToken,                             // Path for discriminant 1 (length 1)
        () => 9 + initialToken                          // Path for discriminant 2 (length 2, second digit 9)
    ];

    // Execute the selected computation path and return its result.
    return computationPaths[discriminantValue]();
};

console.log(processValue(require("fs").readFileSync("/dev/stdin", "utf8")));