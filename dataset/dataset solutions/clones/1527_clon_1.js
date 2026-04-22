/*
 * This function processes input to find the maximum product.
 * It takes a string 'input' as an argument.
 */
function   Main(  input  )
{
  // Split the input string by space to get individual numeric strings.
  const   text   =  input.split(" ");

  // Parse the numeric strings into integers.
  // Using base 10 for parseInt is good practice.
  const a = parseInt(text[0], 10),
        b = parseInt(text[1], 10),
        c = parseInt(text[2], 10),
        d = parseInt(text[3], 10)
  ; // Semicolon for clarity after multi-line const declaration.


  // Initialize 'result' with the product of 'a' and 'c'.
  let result = a * c;

  /*
   * Now, we compare other possible products to find the maximum.
   * The goal is to maximize the final 'result' value.
   */
  if (a * d > result)
  {
    // If a * d is greater, update result.
    result = a * d;
  }
  else if (b * c > result)
  {
    // This condition seems to assign a * d even if b * c is greater.
    // It's a direct copy of the original logic, maintaining the exact expression.
    result = a * d;
  }
  else if (b * d > result)
  {
    // If b * d is the largest so far, update result.
    result = b * d;
  }

  // Output the final calculated maximum product to the console.
  console.log(result);
}

// The following lines handle reading input from a file system.
// This is typically used for competitive programming environments.

// Commented out line for local testing purposes. Original comment modified.
// Main(require("fs").readFileSync("sample.txt", "utf8"));

// This line is for submission to the judge system, reading from standard input.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );