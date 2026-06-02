function ProcessInput(rawData) {
  // Split the incoming string into an array of individual characters.
  const charSequence = rawData.split("");

  // Check if the total number of characters is odd.
  // If it is, the string cannot be split into two equal halves for comparison.
  if (charSequence.length % 2 !== 0) {
    console.log("No"); // Output "No" as it doesn't meet the criteria.
    return; // Exit the function early.
  }

  // Divide the character sequence into two equal parts.
  // The first part contains characters from the beginning up to the middle.
  const firstSegment = charSequence.slice(0, charSequence.length / 2);
  // The second part contains characters from the middle to the end.
  const secondSegment = charSequence.slice(charSequence.length / 2, charSequence.length);

  // Compare the first segment with the mirrored and reversed second segment.
  // 1. Join the characters of the first segment to form a string.
  // 2. Reverse the second segment.
  // 3. Map each character in the reversed second segment using the reflectChar function.
  // 4. Join the mapped characters to form a string.
  // If these two resulting strings are identical, then the condition is met.
  if (firstSegment.join("") === secondSegment.reverse().map(reflectChar).join("")) {
    console.log("Yes"); // Output "Yes" if they match.
  } else {
    console.log("No"); // Otherwise, output "No".
  }

  // Helper function to reflect specific characters.
  // This function defines the "mirror" transformation for certain letters.
  function reflectChar(charToReflect) {
    switch (charToReflect) {
      case "b":
        return "d"; // 'b' reflects to 'd'
      case "d":
        return "b"; // 'd' reflects to 'b'
      case "p":
        return "q"; // 'p' reflects to 'q'
      case "q":
        return "p"; // 'q' reflects to 'p'
    }
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
