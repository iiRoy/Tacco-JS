function myin()
{
  // This function reads input from standard input.
  // It uses Node.js 'fs' module to read the file synchronously.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();

}

// This utility function converts input strings based on the specified type.
// Conversion types:
//   0: No conversion, returns the string as is.
//   1: Converts to an integer using parseInt.
//   2: Splits the string by space characters.
//   3: Splits the string by newline characters.
//   4: Splits by space, then converts each part to a number.
//   5: Splits by newline, then converts each part to a number.
//   6: Splits the string into individual characters.
//   7: Splits into characters, then converts each character to a number.
function myconv(  i,
                  no
                )
{
  switch(no)
  {
    case 0:
      // Case 0: Return the input as is.
      return i;

    case 1:
      // Case 1: Parse the input as an integer.
      return parseInt(i);

    case 2:
      // Case 2: Split the input string by spaces.
      return i.split(" ");

    case 3:
      // Case 3: Split the input string by newline characters.
      return i.split("\n");

    case 4:
      // Case 4: Split by spaces and map each part to a Number.
      return i.split(" ").map(
        (a)=>Number(a)
      );

    case 5:
      // Case 5: Split by newlines and map each part to a Number.
      return i.split("\n").map(
        (a)=>Number(a)
      );

    case 6:
      // Case 6: Split the input string into individual characters.
      return i.split("");

    case 7:
      // Case 7: Split into characters and map each character to a Number.
      return i.split("").map(
        (a)=>Number(a)
      );
  }
}

// The main function where the core logic resides.
// It processes the input to find the minimum cost.
function Main(  input  )
{
  // First, convert the raw input string into an array of lines.
  input = myconv(input, 3);

  // Extract initial values for A, B, and M from the first line of input.
  // These are space-separated numbers.
  const A = myconv(input[0], 4)[0];
  const B = myconv(input[0], 4)[1];
  const M = myconv(input[0], 4)[2];

  // Extract the list of prices for item 'a' from the second line.
  const list_a = myconv(input[1], 4);

  // Extract the list of prices for item 'b' from the third line.
  const list_b = myconv(input[2], 4);

  // Remove the first three lines of input as they have been processed.
  input.shift(); // Remove the line containing A, B, M
  input.shift(); // Remove the line containing list_a
  input.shift(); // Remove the line containing list_b


  // Calculate the minimum price for item 'a' without any discount.
  // Using apply with null context for Math.min.
  a = Math.min.apply(null, list_a);

  // Calculate the minimum price for item 'b' without any discount.
  b = Math.min.apply(null, list_b);

  // Initialize 'm' with the sum of the minimum prices of 'a' and 'b'
  // (this represents the base minimum cost without any special deals).
  let m = a + b;


  // Get the number of remaining lines, which represent discount deals.
  len = input.length;

  // Iterate through each discount deal.
  for(
    let i = 0;
    i < len;
    i++
  )
  {
    // Parse the current deal line: x (index for list_a), y (index for list_b), c (discount amount).
    // Note: indices are 1-based in input, so subtract 1 for 0-based array access.
    let x = myconv(input[i], 4)[0] - 1;
    let y = myconv(input[i], 4)[1] - 1;
    let c = myconv(input[i], 4)[2];

    // Calculate the total cost for this specific deal.
    // It's the price of item_a[x] + price of item_b[y] - discount 'c'.
    let deals = list_a[x] + list_b[y] - c;

    // If this deal's cost is less than the current minimum 'm', update 'm'.
    if (
      deals < m
    )
    {
      m = deals;
    }
  }

  // Output the final minimum cost found.
  console.log(m);
}

// Call the Main function with the input read from stdin.
Main(
  myin()
);