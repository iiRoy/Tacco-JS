const rawData = require('fs').readFileSync('/dev/stdin', 'UTF-8'); // Acquire raw data from standard input stream

const renderShape = (rawData) => { // Define a processing function for geometric shapes
  const lineSegments = rawData.split('\n'); // Divide the input string into individual line segments

  for (let idx = 0; idx < lineSegments.length; idx++) { // Traverse through each segment of the input
    // Parse numerical dimensions (height and width) from the current line
    const [heightVal, widthVal] = lineSegments[idx].split(' ').map(Number);

    // Check for the specific termination condition (both dimensions are zero)
    if (heightVal === 0 && widthVal === 0) {
      return false; // Terminate function execution if the condition is met
    }

    // Construct and display the rectangular pattern using the parsed dimensions
    console.log(Array(heightVal + 1).join(Array(widthVal + 1).join('#') + '\n'));
  }
};

renderShape(rawData); // Initiate the shape rendering process with the collected input data
