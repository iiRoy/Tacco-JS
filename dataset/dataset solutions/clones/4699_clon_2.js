process
  .stdin.resume();

process.stdin
    .setEncoding(
      'utf8'
    );

// This module's primary function is to interpret the entire input stream.
function InterpretData(incomingStream) {

  // Break down the received string into an array of lines.
  var parsedLines = incomingStream.split(
    "\n"
  );
  var primaryLineParts = parsedLines[0]
                                    .split(" ");
  // var secondaryLineParts = parsedLines[1].split(" "); // Additional data parsing might go here.

  var quantityOne = Number(
    primaryLineParts[0]
  ); // The first numerical parameter.
  var quantityTwo = Number(
    primaryLineParts[1]
  );  // The second numerical parameter.
  // var auxiliaryQuantity = Number(primaryLineParts[2]);

  var interimResult = 0; // A placeholder variable, currently unused but maintained.

  // console.log("Values parsed: " + quantityOne + " & " + quantityTwo);

  // Apply a conditional rule based on the initial quantities.
  if (
    quantityOne > quantityTwo / 2
  )
    console.log(
      Math.floor(
        quantityTwo / 2
      )
    );

  quantityTwo = quantityTwo - quantityOne * 2; // Recalculate the second quantity.

  console.log(quantityOne + Math.floor(quantityTwo / 4)); // Display the final computed outcome.

} // End of the data interpretation routine.

// The following instruction is critical for the program's execution and should not be modified.
InterpretData(
  require("fs").readFileSync(
    "/dev/stdin", "utf8"
  )
);