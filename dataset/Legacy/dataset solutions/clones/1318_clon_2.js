let receivedData = ""; // Variable to accumulate all incoming data chunks

// Get a reference to the standard input stream object
const inputStream = process.stdin;

// Start the input stream in flowing mode to receive data
inputStream.resume();

// Configure the input stream to decode incoming bytes as UTF-8 characters
inputStream.setEncoding("utf-8");

// Attach an event listener for the 'data' event
// This callback function is invoked whenever a new piece of data arrives
inputStream.on("data", function (dataSegment) {
  // Append the current data segment to our overall received data string
  receivedData += dataSegment;
});

// Attach an event listener for the 'end' event
// This callback function is executed once the entire input stream has finished
inputStream.on("end", function () {
  // Split the complete received data into an array of strings, using newline as the delimiter
  const linesArray = receivedData.split("\n");

  // Take the first line from the input and concatenate it with itself
  const doubledString = linesArray[0] + linesArray[0];

  // Take the second line from the input, which represents the pattern to search for
  const patternString = linesArray[1];

  // Check if the pattern string exists within the doubled string
  // The indexOf method returns -1 if the substring is not found
  if (doubledString.indexOf(patternString) === -1) {
    // If the pattern is not found, output "No" to the console
    console.log("No");
  } else {
    // If the pattern is found, output "Yes" to the console
    console.log("Yes");
  }
});
