require("fs")
  .readFileSync("/dev/stdin", "utf8") // Obtain the raw input data from standard input, decoded as UTF-8.
  .trim() // Eliminate any leading or trailing whitespace characters from the entire input string.
  .split('\n\n') // Divide the cleaned input into an array of distinct segments, using double newlines as the separator.
  .map(function(inputSegment) { // Process each individual segment from the array.

    // First, remove all whitespace characters from the current segment,
    // then split it into an array of characters, and finally join them back
    // into a single, contiguous string.
    let processedString = inputSegment.replace(/\s/g, '').split('').join('');

    // Based on the presence of specific binary patterns within the processed string,
    // output a corresponding category character to the console.
    // The checks are performed in a specific order of precedence.
    console.log(
      processedString.indexOf("1111") !== -1 ? "C" :
      processedString.indexOf("111") !== -1 ? "F" :
      processedString.indexOf("1101") !== -1 ? "D" :
      processedString.indexOf("101") !== -1 ? "B" :
      processedString.indexOf("1000001") !== -1 ? "G" :
      processedString.indexOf("10000001") !== -1 ? "A" :
      "E" // Default category if no other pattern is matched.
    );
  });
