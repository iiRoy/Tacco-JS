/*
 * This script processes an input string to determine if it can be made
 * into a palindrome by replacing 'x' characters.
 * It counts the minimum 'x' replacements needed or returns '-1' if impossible.
 */
console.log((
    // The main processing function is an immediately invoked function expression (IIFE)
    // It takes the raw input data as its parameter.
    (inputData => {

        // First, normalize the input by removing any leading or trailing whitespace.
        const processedString = inputData.trim();

        // Calculate the index of the last character in the processed string.
        // This will be used for the right-hand pointer in the palindrome check.
        const lastIndex = processedString.length - 1;

        // Initialize a counter for the 'x' character replacements needed.
        // This will track how many 'x's we encounter and effectively "use" to match characters.
        let mutationCount = 0;

        // Use two pointers, one starting from the beginning (leftPointer) and one from the end (rightPointer).
        // They move towards the center of the string.
        for (let leftPointer = 0, rightPointer = lastIndex; leftPointer < rightPointer; leftPointer++, rightPointer--) {
            // While the characters at the current pointers do not match, we need to resolve the mismatch.
            // This inner loop handles cases where one or both characters are 'x' or neither are.
            while (processedString[leftPointer] !== processedString[rightPointer]) {
                // If the character at the left pointer is 'x', we can "use" it to match the right character.
                // Increment the mutation counter and advance the left pointer.
                if (processedString[leftPointer] === 'x') {
                    mutationCount++;
                    leftPointer++;
                }
                // Else if the character at the right pointer is 'x', we can "use" it.
                // Increment the mutation counter and retract the right pointer.
                else if (processedString[rightPointer] === 'x') {
                    mutationCount++;
                    rightPointer--;
                }
                // If neither character is 'x' and they don't match, then it's impossible to form a palindrome.
                // In this scenario, we immediately return a special error code.
                else {
                    return '-1';
                }
            }
        }
        // If the loop completes, it means the string can be made into a palindrome.
        // Return the total count of 'x' mutations required as a string.
        return `${mutationCount}`;
    })
    // The IIFE is immediately invoked with content read from standard input.
    // This part is an external dependency and not subject to internal renaming.
    (require('fs').readFileSync('/dev/stdin', 'utf8'))
));