console.log((inputStr => {
  // Parse initial configuration values from the input string
  const [ [ heightVal, widthVal, distStep ], ...tempData ] = inputStr.trim().split('\n').map(rowStr => rowStr.split(' ').map(valNum => valNum | 0));

  // Initialize a mapping array to store coordinates for each number
  const posMap = Array(heightVal * widthVal + 1).fill([]);

  // Populate the position map with (row, column) coordinates
  for (let idxA = 0; idxA < heightVal; idxA++) {
    for (let idxB = 0; idxB < widthVal; idxB++) {
      posMap[tempData[idxA][idxB]] = [idxA, idxB];
    }
  }

  // Prepare an array to store cumulative "magic" scores
  const scoreArr = Array(heightVal * widthVal + 1).fill(0);

  // Calculate cumulative scores based on the distance step
  for (let idxA = 1; idxA <= distStep; idxA++) {
    for (let idxB = idxA; idxB <= heightVal * widthVal - distStep; idxB += distStep) {
      // Calculate Manhattan distance between current position and position + distStep
      scoreArr[idxB + distStep] = Math.abs(posMap[idxB][0] - posMap[idxB + distStep][0]) +
                                   Math.abs(posMap[idxB][1] - posMap[idxB + distStep][1]) +
                                   scoreArr[idxB]; // Add previous cumulative score
    }
  }

  // Extract the number of queries
  const [ queryCount ] = tempData[heightVal];

  // Initialize an array to store the results of each query
  let resultsList = [];

  // Process each query
  for (let idxA = 0; idxA < queryCount; idxA++) {
    // Get the left and right bounds for the current query
    const [ leftBound, rightBound ] = tempData[heightVal + 1 + idxA];
    // Calculate the difference in cumulative scores and add to results
    resultsList.push(scoreArr[rightBound] - scoreArr[leftBound]);
  }

  // Join the results with newline characters and return
  return resultsList.join('\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
