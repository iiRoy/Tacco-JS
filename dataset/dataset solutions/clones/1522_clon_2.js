/* This function orchestrates the primary data transformation. */
function ExecuteProcessing ( incomingText ) {
  // Convert the received textual data into a numerical format.
  let parsedNumber = Number(incomingText);

  // Perform a bitwise XOR operation with the constant 1 and output the result.
  console.log(parsedNumber ^ 1);
}

/*
 * The program starts by reading content from standard input,
 * then passes it to the main processing routine.
 */
ExecuteProcessing ( require("fs") . readFileSync(
  "/dev/stdin",
  "utf8"
) );