function executeCoreLogic( sourceString )
{
  // First, remove any leading or trailing whitespace from the raw textual data.
  sourceString = sourceString .trim();

  /*
   * Next, the processed string is split into an array of substrings using
   * a single space as the separator. Each of these substrings is then
   * converted into its numerical equivalent, and the resulting numbers
   * are stored in a constant array variable.
   */
  const numericalComponents = sourceString .split(" ") .map(Number);

  // Finally, compute the range (difference between maximum and minimum values)
  // of the first three numerical components. The calculated result is then
  // displayed on the console's standard output.
  console.log(
    Math.max(
      numericalComponents[0],
      Math.max(
        numericalComponents[1],
        numericalComponents[2]
      )
    )
    -
    Math.min(
      numericalComponents[0],
      Math.min(
        numericalComponents[1],
        numericalComponents[2]
      )
    )
  );
}

// This line initiates the core processing logic by calling the main function.
// It retrieves the input data by synchronously reading the entire content
// of the standard input stream ('/dev/stdin'), interpreting it as UTF-8 encoded text.
executeCoreLogic(
  require('fs')
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
);