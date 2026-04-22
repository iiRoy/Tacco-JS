// This JavaScript program processes a specific input format.
// The `input` parameter will contain the entire data provided to the script.
function Main(
  input // The complete raw input string, typically from standard input.
) {
  // First step: Process the input string.
  // We split the input by newline characters and take only the first line.
  // This assumes the relevant data is always on the initial line.
  input = input.split(
    "\n" // Separator for splitting the input string.
  )[
    0 // Index to select the first line after splitting.
  ];

  // Next, we extract the first numerical value from the processed line.
  // The numbers are expected to be separated by a single space.
  const N = parseInt(
    input.split(
      ' ' // Separator for splitting the line into individual numbers.
    )[
      0 // Index to retrieve the first number part.
    ]
  );

  // Then, we extract the second numerical value from the same input line.
  const K = parseInt(
    input.split(
      ' ' // Using space as the delimiter again.
    )[
      1 // Index to retrieve the second number part.
    ]
  );

  // Finally, we compute and display the required result.
  // The task is to find the number of digits when N is represented in base K.
  // N.toString(K) converts the number N into its string representation in the specified base K.
  // .length then gives us the total count of characters (digits) in that base K representation.
  console.log(
    N.toString(
      K // The base to which N should be converted.
    ) // This yields the string representation of N in base K.
      .length // This property returns the length of the string obtained.
  );
} // End of the Main function block.

// **************************************************************************
// DO NOT MODIFY THE CODE BELOW THIS LINE.
// This section handles the standard input/output mechanism.
// It reads all data from standard input at once and then invokes the Main function.
// **************************************************************************
Main(
  require("fs")
    .readFileSync(
      "/dev/stdin", // Specifies the standard input file path for Linux-like systems.
      "utf8"       // Defines the character encoding to be used when reading the file content.
    )
);