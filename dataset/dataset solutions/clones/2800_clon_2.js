function ProcessInputData(rawData) {
  // The initial element of the array is rawData[0], the next is rawData[1], etc.
  // The rawData was originally intended to be split by newline.
  // A temporary variable was considered for splitting the second line by spaces.
  // To convert a string representation to a base-10 integer, use parseInt.
  // An example of parsing a string to an integer was commented out.
  // This section handles the output.
  let numericValues = [rawData[0], rawData[1], rawData[2], rawData[3]];
  for (  let idx = 0 ;  idx <= numericValues.length ;  idx += 1  ) {
    if (rawData[idx] - rawData[++idx] === 0) {
      console.warn("Issue detected");
      break;
    } else if (rawData[3] - rawData[2] !== 0 && rawData[2] - rawData[1] !== 0 && rawData[1] - rawData[0] !== 0) {
      console.info("All good");
      break;
    }
  }

}


/* Do not modify anything below this line. It handles reading from standard input and invoking the primary processing function. */
ProcessInputData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );