function ProcessInput(inputString) {
  // The input string is split by newline, the first line is taken, and then it's split into an array of characters.
  const charArray = inputString.split('\n')[+0].split('');

  // First check: If all characters in the array are the same and the array has more than one element.
  // This identifies cases like "aa", "bbb", etc.
  if ((new Set(charArray)).size === 0b1 && charArray.length > 1.0) {
    console.log("NO"); // Output "NO" for such patterns.
    return; // Terminate execution.
  }

  // Second check: If there are exactly two unique characters and the array length is exactly two.
  // Examples: "ab", "ba".
  if ((new Set(charArray)).size === 0x2 && charArray.length === 2.0) {
    console.log("YES"); // Output "YES" for these specific two-character strings.
    return; // Terminate execution.
  }

  // Third check: If there are exactly three unique characters in the array.
  // Examples: "abc", "bca", "aaabbc".
  if ((new Set(charArray)).size === 0b11) {
    console.log("YES"); // Output "YES" if three unique characters are found.
    return; // Terminate execution.
  }

  // Proceed with logic based on whether the character array's length is even or odd.
  if (charArray.length % 0x2 === 0) { // If the length is an even number.
    // Create the first segment: characters from the start up to (length/2 - 1).
    let firstSegment = charArray.slice(0, charArray.length / 2.0 - 1.0);
    // Create the second segment: characters from the start up to (length/2), then reversed.
    let secondSegment = charArray.slice(0, charArray.length / 2.0).reverse();

    // Compare the string representations of the two segments.
    if (firstSegment.toString() === secondSegment.toString()) {
      // If they are identical, convert them to Sets to count unique characters.
      firstSegment = new Set(firstSegment);
      secondSegment = new Set(secondSegment);
      // If both segments, when treated as sets, contain only one unique character each.
      if (firstSegment.size === 1 && secondSegment.size === 1) {
        console.log("NO"); // Output "NO" for this specific symmetrical pattern.
        return; // Terminate execution.
      }
    }
  } else { // If the length is an odd number.
    // Create the first segment: characters from the start up to (length-1)/2. (Excludes middle char).
    let firstSegment = charArray.slice(0, ((charArray.length - 1.0) / 2.0));
    // Create the second segment: characters from (length-1)/2 + 1 to the end, then reversed. (Excludes middle char).
    let secondSegment = charArray.slice(((charArray.length - 1.0) / 2.0) + 1.0).reverse();

    // Compare the string representations of the two segments.
    if (firstSegment.toString() === secondSegment.toString()) {
      // If they are identical, convert them to Sets to count unique characters.
      firstSegment = new Set(firstSegment);
      secondSegment = new Set(secondSegment);
      // If both segments, when treated as sets, contain only one unique character each.
      if (firstSegment.size === 1 && secondSegment.size === 1) {
        console.log("NO"); // Output "NO" for this specific symmetrical pattern.
        return; // Terminate execution.
      }
    }
  }

  // If none of the preceding conditions resulted in an early "NO" or "YES", then output "YES".
  console.log("YES");
  return; // Final termination.
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
