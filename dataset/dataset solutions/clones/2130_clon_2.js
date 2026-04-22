/*
 * This routine processes a given string input containing two numeric values.
 * Its purpose is to perform a base conversion on the first number using the second as the base,
 * and then log the total count of digits in the resulting converted string.
 */
function ProcessInput( dataString ) {
  // Break down the input string into an array of its constituent parts,
  // typically separated by a space character.
  const partsArray = dataString.split( ' ' );

  // Parse the first element of the array into an integer. This will be the number
  // that we intend to convert to a different base.
  let currentNumber = parseInt( partsArray[0], 10 );

  // Parse the second element into an integer. This represents the target base
  // for our number conversion operation.
  const baseValue = parseInt( partsArray[1], 10 );

  // Initialize an empty string which will accumulate the digits of the
  // converted number in the new base.
  let conversionOutput = '';

  // Continue the conversion process as long as the number to be converted
  // remains greater than zero.
  while ( currentNumber > 0 ) {
    // Calculate the remainder when the current number is divided by the base.
    // This remainder is the next digit in the new base (from right to left).
    conversionOutput += currentNumber % baseValue;

    // Update the current number by performing integer division (floor division)
    // with the base. This prepares the number for the next iteration.
    currentNumber = Math.floor( currentNumber / baseValue );
  }

  // Finally, output the total character length of the generated conversion string
  // to the console.
  console.log( conversionOutput.length );
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、ProcessInputを呼び出します）
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));