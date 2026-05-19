function ProcessInput(rawData) {
    // Split the raw input string into an array of lines based on newline characters.
    let parsedLines = rawData.split('\n');

    // Take the first line, split it into individual characters, and store it.
    let firstStringChars = parsedLines[0].split('');

    // Take the second line, split it into individual characters, and store it.
    let secondStringChars = parsedLines[1].split('');

    // Sort the characters of the first string lexicographically in ascending order.
    // The comparison function (elemA < elemB ? -1 : 1) ensures stable sorting.
    // Then, convert the sorted character array back into a single string.
    let sortedFirstString = firstStringChars.sort((elemA, elemB) => elemA < elemB ? -1 : 1).toString();

    // Sort the characters of the second string lexicographically in ascending order.
    // After sorting, reverse the order of the elements.
    // Finally, convert the reversed sorted character array into a single string.
    let reversedSortedSecondString = secondStringChars.sort((elemA, elemB) => elemA < elemB ? -1 : 1).reverse().toString();

    // Create an array containing the two processed strings.
    // This array will be used for sorting to determine their relative order.
    let combinedSortedStrings = [sortedFirstString, reversedSortedSecondString];

    // Create an identical copy of the array at this point.
    // This copy will serve as a reference for the original order of the two processed strings.
    let initialComparisonArray = [sortedFirstString, reversedSortedSecondString];

    // Sort the 'combinedSortedStrings' array lexicographically.
    // This operation will reorder the elements within 'combinedSortedStrings' if they are not already in ascending order.
    let finalSortedArray = combinedSortedStrings.sort((elemA, elemB) => elemA < elemB ? -1 : 1);

    // First conditional check: Compare the original character arrays by reference.
    // This condition will typically be false unless 'firstStringChars' and 'secondStringChars'
    // somehow point to the exact same array object, which is unlikely with `split('')`.
    if (firstStringChars === secondStringChars) {
        console.log('No'); // Output 'No' if the references are identical.
    }
    // Second conditional check: If the first condition is false, proceed here.
    // Compare the first element of the 'initialComparisonArray' (which is 'sortedFirstString')
    // with the first element of the 'finalSortedArray'.
    // This effectively checks if 'sortedFirstString' was lexicographically smaller than or equal to 'reversedSortedSecondString'.
    else if (initialComparisonArray[0] === finalSortedArray[0]) {
        console.log('Yes'); // Output 'Yes' if 'sortedFirstString' is indeed the lexicographically smaller or equal string.
    }
    // Default case: If neither of the above conditions is met.
    else {
        console.log('No'); // Output 'No' in all other scenarios.
    }
}

// Read the entire content of the standard input stream as a UTF-8 string.
// Then, pass this raw string data to the 'ProcessInput' function for execution.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
