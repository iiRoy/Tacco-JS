let valueCounts = {};
let maxFrequency = 0;
let maxLength = 0;
let mostFrequentNum = '';
let longestString = '';

require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(' ')
  .some(function(currentElement) {
    // Check if the current element has been encountered before.
    if (valueCounts[currentElement]) {
      // If yes, increment its count.
      valueCounts[currentElement]++;
      // If the new count is greater than the highest frequency recorded so far,
      if (valueCounts[currentElement] > maxFrequency) {
        // Update the highest frequency.
        maxFrequency = valueCounts[currentElement];
        // And store this element as the most frequent one.
        mostFrequentNum = currentElement;
      }
    } else {
      // If it's the first time seeing this element, initialize its count to 1.
      valueCounts[currentElement] = 1;
    }

    // Determine the length of the current string element.
    let currentLength = currentElement.length;
    // If this element's length is greater than the maximum length found until now,
    if (currentLength > maxLength) {
      // Update the longest string.
      longestString = currentElement;
      // And update the maximum length.
      maxLength = currentLength;
    }
    // The 'some' method will continue iterating through all elements
    // as long as the callback function does not return a truthy value.
    return false;
  });

// Print the most frequent number and the longest string, separated by a space.
console.log(mostFrequentNum + ' ' + longestString);
