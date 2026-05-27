const ProcessInput = (inputStr => {
    "use strict";

    // The input string is first split by newline characters.
    // We then take the second line (index 1) and split it by spaces
    // to obtain an array of individual string tokens.
    let tokenList = inputStr.split("\n")[1].split(" ");

    // An object is initialized to store the frequency of each unique token.
    let frequencyMap = {};

    // Iterate through each token in the generated list.
    for (const currentWord of tokenList) {
        // Increment the count for the current token.
        // If the token is encountered for the first time, its count starts at 0 before incrementing.
        frequencyMap[currentWord] = (frequencyMap[currentWord] || 0) + 1;
    }

    // After populating the frequency map, we iterate through its unique keys.
    for (const uniqueToken of Object.keys(frequencyMap)) {
        const currentCount = frequencyMap[uniqueToken]; // Retrieve the frequency for the current unique token.

        // For each unique token, we calculate and store three related values:
        // 'countVal': The raw frequency of the token.
        // 'pairsVal': The number of ways to choose 2 items from 'currentCount' items (nC2).
        // 'tripletsVal': The number of ways to choose 2 items from 'currentCount - 1' items ((n-1)C2).
        frequencyMap[uniqueToken] = {
            countVal: currentCount,
            pairsVal: currentCount * (currentCount - 1) / 2,
            tripletsVal: (currentCount - 1) * (currentCount - 2) / 2
        };
    }

    // Declare a variable to hold the cumulative sum for each iteration.
    let calculatedSum;

    // Iterate through the original list of tokens using a traditional for loop with an index.
    for (let idx = 0; idx < tokenList.length; idx++) {
        const currentElement = tokenList[idx]; // Get the token at the current index.

        calculatedSum = 0; // Reset the sum for each new element.

        // Iterate through the keys (unique tokens) of the frequency map.
        for (const mapKey of Object.keys(frequencyMap)) {
            // Check if the current element from the tokenList matches the unique token from the map.
            if (currentElement === mapKey) {
                // If they match, add the 'tripletsVal' (which is (n-1)C2) associated with this token.
                calculatedSum += frequencyMap[mapKey].tripletsVal;
            } else {
                // If they do not match, add the 'pairsVal' (which is nC2) associated with this token.
                calculatedSum += frequencyMap[mapKey].pairsVal;
            }
        }
        // Output the final calculated sum for the current element to the console.
        console.log(calculatedSum);
    }
});

// Read the input from standard input.
// The 'fs' module is used to read the file, '/dev/stdin' is the standard input path.
// The content is decoded as UTF-8 and any leading/trailing whitespace is removed.
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Invoke the main processing function with the prepared input content.
ProcessInput(fileContent);
