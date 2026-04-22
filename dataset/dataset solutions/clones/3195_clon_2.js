let inputBuffer = [];
let targetSum, numChoices;
let choiceData, resultMemo;

const ioInterface = require('readline');

const lineReader = ioInterface.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.addListener('line', function (currentLine) { // Captures each input line
    inputBuffer.push(currentLine);                     // Stores the line in an array
});

lineReader.addListener('close', function () {          // Executes when input stream closes
    // Array mapping digits (0-9) to their corresponding match stick counts.
    // Note: digit 0 has 0 sticks (not typically used in problem, but included for completeness)
    const digitMatches = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    // Parse the first line for the main parameters
    targetSum = parseInt(inputBuffer[0].split(" ")[0], 10); // The total match stick count we aim for
    numChoices = parseInt(inputBuffer[0].split(" ")[1], 10); // The number of available digit choices

    // Initialize an array to hold the properties of each selectable digit
    choiceData = new Array(numChoices + 1);

    // The element at index 0 is a placeholder, not used in core logic
    choiceData[0] = { digitValue: 0, stickCount: 0 };

    // Process the second line of input to populate `choiceData`
    const rawChoices = inputBuffer[1].split(" ");
    for (let idx = 1; idx <= numChoices; idx++) {
        const currentDigit = parseInt(rawChoices[idx - 1], 10);
        choiceData[idx] = {
            digitValue: currentDigit,                     // The actual numeric value of the digit
            stickCount: digitMatches[currentDigit],       // The number of match sticks for this digit
        };
    }

    let currentCandidate = ''; // Temporary string to build potential longest numbers
    resultMemo = new Array(targetSum + 1); // Dynamic programming array: `resultMemo[k]` stores the longest number for `k` sticks
    resultMemo.fill('');                   // Initialize all entries to an empty string

    // Iterate through all possible stick counts from 1 up to the targetSum
    for (let currentWeight = 1; currentWeight <= targetSum; currentWeight++) {
        // Iterate through each available digit choice
        for (let currentChoice = 1; currentChoice <= numChoices; currentChoice++) {
            const remainingWeight = currentWeight - choiceData[currentChoice].stickCount;

            // If using the current digit would result in negative remaining sticks, it's not a valid path
            if (remainingWeight < 0) {
                continue;
            } else {
                // Form a new candidate number by appending the current digit to the best number for `remainingWeight`
                currentCandidate = resultMemo[remainingWeight] + choiceData[currentChoice].digitValue;

                // Compare the `currentCandidate` with the existing best number for `currentWeight`
                // A candidate is "better" if:
                // 1. It's longer.
                // 2. It's the same length but lexicographically larger (e.g., "9" > "1").
                if (resultMemo[currentWeight].length < currentCandidate.length ||
                    (resultMemo[currentWeight].length === currentCandidate.length && resultMemo[currentWeight] < currentCandidate)) {
                    resultMemo[currentWeight] = currentCandidate; // Update the best number for `currentWeight`
                }
            }
        }
    }

    // Output the final result, which is the longest number for the `targetSum`
    process.stdout.write(resultMemo[targetSum] + '\n');
});