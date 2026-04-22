process.stdin.resume(); // Activate standard input stream

process.stdin.setEncoding('utf8'); // Configure input encoding for text interpretation

let  collectedInputText   =   ''; // Buffer for accumulating all incoming data

// Register a handler for received data segments
process.stdin.on(  'data'  ,   (inputSegment)  =>  {
  collectedInputText  +=  inputSegment; // Append the current segment to our buffer
}  );

// Register a handler for the end of the input stream
process.stdin.on(  'end'  ,   ()  =>  {
  const   contentRows   =   collectedInputText.split('\n'); // Divide the full input into individual lines
  const   numericPairPattern   =   /(\d+)\s(\d+)/; // Regex to find two numbers separated by whitespace

  // Iterate through each line of the received content
  for   (  let   lineIndex   =   0;   lineIndex   <   contentRows.length;   lineIndex++  )   {
    const   matchOutcome   =   numericPairPattern.exec(contentRows[lineIndex]); // Attempt to parse numbers from the current line

    // Check if a valid match was found and it contains two captured groups (plus the full match)
    if   (  matchOutcome   &&   matchOutcome.length   ===   3  )   {
      // Convert captured strings to integers, sum them, and convert the result back to a string
      const   sumResult   =   Number.parseInt(matchOutcome[1])   +   Number.parseInt(matchOutcome[2]);
      process.stdout.write(  String(sumResult)  ); // Output the calculated sum
      process.stdout.write(  '\n'  ); // Append a newline character for formatting
    }
  }
}  );