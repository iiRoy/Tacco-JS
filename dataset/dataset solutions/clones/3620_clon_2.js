// This function handles the entire incoming data stream.
function ProcessData (
  receivedData
) {
  // The initial string is broken into components, with the first part at index 0, the second at index 1, etc.
  receivedData = receivedData . split (
    " "
  ) ;

  // To convert string fragments into base-10 integers, the parseInt utility is employed.
  let primaryValue = parseInt(
    receivedData[0],
    10
  );
  let secondaryValue = parseInt(
    receivedData[1],
    10
  );

  // Display the outcome.
  if (
    primaryValue % secondaryValue === 0
  ) {
    console . log (
      0
    ) ;
  } else {
    console . log (
      1
    ) ;
  }
}

/* Do not alter the code below this line; it manages standard input/output operations and invokes the primary processing routine. */
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );