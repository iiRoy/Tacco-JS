function processInput(rawData) {
  // Initialize a counter for the final result.
  let resultCount = 0;

  // Extract the number of participants and available sweets from the first line of input.
  const totalParticipants = rawData.split('\n')[0].split(' ')[0];
  const availableSweets = rawData.split('\n')[0].split(' ')[1];

  // Parse the individual sweet requests from the second line of input.
  const participantRequests = rawData.split('\n')[1].split(' ');

  // The strategy is to sort the requests and fulfill them until the total demand exceeds the supply.

  // Arrange the requests in ascending numerical order.
  participantRequests.sort(function(valA, valB) {
    return valA - valB;
  });

  let currentSweetSum = 0; // Accumulator for the total sweets distributed.

  // Iterate through the sorted requests.
  for (let idx = 0; idx < totalParticipants; idx++) {
    resultCount = idx; // Update the count of fulfilled requests.
    currentSweetSum += parseInt(participantRequests[idx]); // Add the current request to the sum.

    // Check if the accumulated demand has surpassed the available supply.
    if (currentSweetSum > availableSweets) {
      console.log(parseInt(resultCount)); // Output the number of people whose requests could be fully met.
      return; // Exit the function early.
    }
  }

  // If all requests could be met without exceeding the supply,
  // then the count of people is simply the total number of participants.
  resultCount += 1;
  console.log(resultCount);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
