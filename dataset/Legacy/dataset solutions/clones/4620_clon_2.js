function processInput(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  const cleanedInput = rawData.trim();

  // Divide the cleaned string into individual components using a space as the delimiter.
  const [firstComponent, secondComponent, thirdComponent] = cleanedInput.split(" ");

  // Extract the initial character from each component, convert it to uppercase,
  // and then concatenate these capitalized characters to form a final abbreviation.
  let finalAbbreviation = firstComponent.slice(0, 1).toUpperCase() +
                          secondComponent.slice(0, 1).toUpperCase() +
                          thirdComponent.slice(0, 1).toUpperCase();

  // Display the resulting abbreviation to the standard output.
  console.log(finalAbbreviation);
}

// Read the entire content from the standard input stream, assuming UTF-8 encoding,
// and then pass this content to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
