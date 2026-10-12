function processInputData (rawData) {
  // Parse the incoming string data, splitting by whitespace, filtering out empty strings,
  // and converting each remaining part into an integer using base 10.
  const numericValues = rawData.split(/\s/g).filter(item => item).map(item => parseInt(item, 10));

  // Assign the second parsed number to represent the segment size.
  const segmentSize = numericValues[1];
  // Assign the first parsed number to represent the total count of elements.
  const totalElements = numericValues[0];

  // Output the calculated result to the console.
  // If the segment size is identical to the total elements, print 1.
  // Otherwise, compute total elements divided by (segment size minus 1).
  console.log(segmentSize === totalElements ? 1 : totalElements / (segmentSize - 1));
}

// Invoke the primary data processing function,
// supplying it with content read from the standard input stream as a UTF-8 string.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
