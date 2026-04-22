/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition of a Type I clone:
 * - All identifiers (variable names, function names, etc.) are exactly the same.
 * - All operators and expressions are identical.
 * - The only modifications are extensive changes to whitespace (spaces, tabs, newlines)
 *   and comments (addition, removal, or modification).
 * The goal is to make the code appear visually distinct while maintaining
 * absolute structural and logical equivalence to the original.
 */

// Function to read input from standard input.
// It reads the entire file, trims whitespace, and returns the string.
function myin()
{
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}


// Function to output to standard output.
// It simply logs the provided text to the console.
function myout(t)
{
  console.log(t);
}


// Function to output to standard error.
// Useful for debugging messages that shouldn't be part of the main output.
function myerr(t)
{
  console.error(t);
}


// [no]param: This comment block describes the conversion options for the myconv function.
// 0: Do nothing; return the input as is.
// 1: Convert the input string to an integer using parseInt().
// 2: Split the input string by half-width spaces (" ").
// 3: Split the input string by newline characters ("\n").
// 4: Split by half-width spaces and then map each part to a Number.
// 5: Split by newlines and then map each part to a Number.
// 6: Split the input string into individual characters.
// 7: Split into individual characters and then map each character to a Number.
function myconv(i, no)
{
  switch (no)
  {
    case 0:
      // Case 0: No conversion, return original input.
      return i;

    case 1:
      // Case 1: Convert to integer.
      return parseInt(i);

    case 2:
      // Case 2: Split by space.
      return i.split(" ");

    case 3:
      // Case 3: Split by newline.
      return i.split("\n");

    case 4:
      // Case 4: Split by space, then convert to numbers.
      return i.split(" ").map((a) => Number(a));

    case 5:
      // Case 5: Split by newline, then convert to numbers.
      return i.split("\n").map((a) => Number(a));

    case 6:
      // Case 6: Split into individual characters.
      return i.split("");

    case 7:
      // Case 7: Split into characters, then convert to numbers.
      return i.split("").map((a) => Number(a));
  }
}


/*
 * The main entry point of the program.
 * It processes the input according to specific logic,
 * likely related to a problem involving array manipulation or "imos" method.
 * The input is first converted to an array of numbers.
 */
function Main(input)
{
  // Convert the raw input string into an array of numbers,
  // splitting by newlines (as per conversion type 5).
  input = myconv(input, 5);

  // The first element of the input array is assigned to N.
  var N = input[0];

  // Remove the first element from the input array.
  input.shift();

  // Add a zero to the end of the input array. This might be a sentinel value.
  input.push(0);

  // Check an initial condition: if the first element (after shift) is not zero.
  // This seems to be an invalid state for the problem.
  if (input[0] != 0)
  {
    myout(-1); // Output -1 indicating an error or impossible case.
    return;    // Terminate the function early.
  }

  // Initialize the output variable, which will accumulate the final result.
  var output = 0;

  // Comment indicating a potential approach: "imos" method (cumulative sum technique).
  // いもす法いける (imosu-hou ikeru) - "Imos method is possible."
  var list = new Array(N + 1).fill(0); // Create an array `list` of size N+1, filled with zeros.

  // Loop iterating backwards from N-1 down to 1.
  for (var i = N - 1; i >= 1; i--)
  {
    // `mae` (before) refers to the current element in the input array.
    var mae = input[i];
    // `ato` (after) refers to the next element in the input array.
    var ato = input[i + 1];

    // Check if the difference between `ato` and `mae` is greater than 1.
    // This is another condition that suggests an invalid problem state.
    if (ato - mae > 1)
    {
      myout(-1); // Output -1.
      return;    // Terminate the function.
    }

    // Conditional logic based on the relationship between `mae` and `ato`.
    if (mae - ato >= 0)
    {
      // If `mae` is greater than or equal to `ato`.
      // Apply "imos" method operations: decrement at `i+1`, increment at `i - (input[i] - 1)`.
      list[i + 1]--;
      list[i - (input[i] - 1)]++;
    }
    else if (ato - mae == 1)
    {
      // If `ato` is exactly 1 greater than `mae`.
      // In this specific case, do nothing and continue to the next iteration.
      continue;
    }
  }

  // Second loop: Calculate prefix sums (cumulative sums) on the `list` array.
  // This is a core step of the "imos" method.
  for (var i = 0; i < N; i++)
  {
    list[i + 1] += list[i]; // Add the previous element's value to the current one.
  }

  // Third loop: Sum up the elements of the modified `list` array to get the final output.
  for (var i = 0; i < N; i++)
  {
    output += list[i]; // Accumulate the sum into the `output` variable.
  }

  // Output the final calculated result.
  myout(output);
}


// Call the Main function with the input obtained from `myin()`.
// This is the entry point for execution when the script is run.
Main(myin());