function ProcessInput(inputString)
{
  // This function analyzes a string to determine if it meets specific palindrome-like criteria.
  // It first splits the input by newline, takes the first line, and then converts it to an array of characters.
  let charArray = inputString.split('\n')[0].split('');

  // Check if the character array has an even number of elements.
  if (charArray.length % 2 === 0) {
    // For even length strings, extract the first half (excluding the middle character if it were odd)
    // and the first half (including the middle character if it were odd) reversed.
    let leftSegment = charArray.slice(0, charArray.length / 2 - 1);
    let reversedRightSegment = charArray.slice(0, charArray.length / 2).reverse();

    // Compare the string representations of these two segments.
    if (leftSegment.toString() === reversedRightSegment.toString()) {
      // If they are identical, convert them to Sets to count unique characters.
      let distinctLeftChars = new Set(leftSegment);
      let distinctRightChars = new Set(reversedRightSegment);
      // If both segments consist of only one unique character each (e.g., "aaaa" or "bbbb"),
      // then it's a special case that results in "NO".
      if (distinctLeftChars.size === 1 && distinctRightChars.size === 1) {
        console.log("NO");
        return; // Exit the function early.
      }
    }
  }
  else { // The character array has an odd number of elements.
    // For odd length strings, extract the part before the middle character
    // and the part after the middle character, then reverse the latter.
    let leftSegment = charArray.slice(0, (charArray.length - 1) / 2);
    let reversedRightSegment = charArray.slice(((charArray.length - 1) / 2) + 1).reverse();

    // Compare the string representations of these two segments.
    if (leftSegment.toString() === reversedRightSegment.toString()) {
      // If they are identical, convert them to Sets to count unique characters.
      let distinctLeftChars = new Set(leftSegment);
      let distinctRightChars = new Set(reversedRightSegment);
      // If both segments consist of only one unique character each (e.g., "aaaaa" or "bbbbb"),
      // then it's a special case that results in "NO".
      if (distinctLeftChars.size === 1 && distinctRightChars.size === 1) {
        console.log("NO");
        return; // Exit the function early.
      }
    }
  }
  // If none of the "NO" conditions were met, then the string satisfies the criteria.
  console.log("YES");
  return;
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
