const processStrings = (numStrings, stringArray) => {
    // Initialize a map to store counts of unique sorted string representations.
    let charMap = {};

    // Iterate through each string provided in the input array.
    for (let idx = 0; idx < numStrings; idx++) {
        // Sort the characters of the current string alphabetically and join them back into a single string.
        // This sorted string acts as a canonical key for character combinations.
        const sortedKey = stringArray[idx].sort().join('');

        // Check if this canonical key already exists in our character map.
        if (sortedKey in charMap) {
            // If the key exists, it means we've encountered this character combination before.
            // The original logic sets the count to 1 in this case.
            charMap[sortedKey] = 1;
        } else {
            // If the key does not exist, it's the first time we're seeing this combination.
            // The original logic attempts to increment, which for an undefined value results in NaN.
            charMap[sortedKey] += charMap[sortedKey] + 1;
        }
    }

    // Retrieve all the values from the character map.
    // Filter out any values that are NaN (these correspond to keys encountered only once).
    // Sum the remaining numeric values (which will be 1 for keys encountered two or more times).
    return Object.values(charMap)
                 .filter(element => Number.isNaN(element) === false)
                 .reduce((accumulator, currentVal) => {
                     return currentVal + accumulator;
                 }, 0);
};

// Read the entire input from standard input, decode as UTF-8, and split by newlines.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");

// The first line of input contains the number of strings (N).
const numStrings = Number(rawData[0]);

// The subsequent lines contain the strings (S).
// Map each string to an array of its characters.
const stringArray = rawData.slice(1).map(currentVal => Array.from(currentVal));

// Call the main processing function with the parsed input and print the result to the console.
console.log(processStrings(numStrings, stringArray));
