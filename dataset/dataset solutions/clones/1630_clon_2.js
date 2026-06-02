const processInput = (rawData) => {
  // The input data is expected to contain multiple lines.
  // We trim any leading/trailing whitespace and split it by newline characters.
  // The problem's structure implies the relevant string is on the second line.
  const [, inputString] = rawData.trim().split('\n');

  // Convert the extracted string into an array of individual characters.
  // This allows for easier manipulation of characters by index.
  const charArray = Array.from(inputString);

  // Initialize counters for 'W' (white) and 'R' (red) characters.
  let whiteCount = 0;
  let redCount = 0;
  // This variable will track the number of swap operations performed.
  let swapOperations = 0;

  // Initialize a pointer to the rightmost end of the character array.
  // This pointer will move inwards as 'W' characters are found and swapped.
  let rightmostRedIdx = charArray.length - 1;

  // First, iterate through the entire character array to count the total
  // occurrences of 'W' and 'R' characters. This is useful for one of the
  // potential minimum values.
  for (let currentChar of charArray) {
    if (currentChar === 'W') {
      whiteCount++; // Increment the count of white characters.
    } else {
      redCount++; // Increment the count of red characters.
    }
  }

  // Now, iterate from the left side of the array up to the `rightmostRedIdx`.
  // The goal is to move all 'W' characters to the right of all 'R' characters
  // with the minimum number of swaps.
  for (let leftPointer = 0; leftPointer < rightmostRedIdx; leftPointer++) {
    // If the character at the current left pointer is 'W', it needs to be moved.
    if (charArray[leftPointer] === 'W') {
      // While the character at the `rightmostRedIdx` is also 'W',
      // move the `rightmostRedIdx` pointer further to the left.
      // We are looking for an 'R' to swap with.
      while (charArray[rightmostRedIdx] === 'W') {
        rightmostRedIdx--;
      }

      // If the `leftPointer` has met or crossed the `rightmostRedIdx`,
      // it means all remaining characters to the right of `leftPointer` are 'W's,
      // or there are no more 'R's to swap with from the right.
      // In this scenario, no more swaps are needed or possible for 'W's on the left.
      if (leftPointer >= rightmostRedIdx) {
        break; // Exit the loop.
      }

      // Perform the swap: the 'W' at `leftPointer` is swapped with the 'R' at `rightmostRedIdx`.
      // This effectively moves an 'R' to the left and a 'W' to the right.
      [charArray[leftPointer], charArray[rightmostRedIdx]] = ['R', 'W'];
      swapOperations++; // Increment the count of performed swaps.
      rightmostRedIdx--; // Move the `rightmostRedIdx` pointer one step to the left
                         // as the character at this position is now a 'W' (or has been processed).
    }
  }
  
  // The problem asks for the minimum of three values:
  // 1. The total number of swaps performed (`swapOperations`).
  // 2. The total count of 'W' characters (`whiteCount`). This represents the cost
  //    if we were to move all 'W's to the right without considering 'R's.
  // 3. The total count of 'R' characters (`redCount`). This represents the cost
  //    if we were to move all 'R's to the left without considering 'W's.
  // The actual minimum operations required is the smallest of these three.
  return console.log(Math.min(swapOperations, Math.min(whiteCount, redCount)));
};

// This conditional statement determines how the script runs.
// If the environment variable 'MYTEST' is set, it calls a 'test()' function (presumably for testing).
// Otherwise, it reads input from standard input ('/dev/stdin') using Node.js's 'fs' module
// and passes the content to the 'processInput' function.
process.env.MYTEST
  ? test()
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
