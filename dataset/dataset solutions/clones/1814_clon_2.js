function ComputeAndDisplay( rawInputString )
{
  // This function takes a string, processes it, and prints a calculated result.

  // First, split the incoming string by spaces.
  // Then, for each resulting segment, convert it into a floating-point number.
  // Store these converted numerical elements in an array.
  var numericalComponents = rawInputString
    .split(' ')
    .map( singleComponent =>
      parseFloat(singleComponent)
    );

  // Now, calculate the multiplication of the first two numbers obtained.
  var computedProduct = numericalComponents[0] * numericalComponents[1];

  // Finally, print the smallest integer greater than or equal to the computed product.
  console.log(
    Math.ceil(computedProduct)
  );
}

// The program execution starts here.
// Read all data from standard input, interpreting it as UTF-8 text.
// Then, pass this entire string to our primary processing function.
ComputeAndDisplay(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8"
  )
);