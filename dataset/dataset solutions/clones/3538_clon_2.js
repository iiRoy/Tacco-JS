function handleResourceDistribution(sourceText)
{

 let fulfilledRecipients = 0; // Initialize a counter for successfully served individuals.

 const parsedLines = sourceText.split('\n'); // Divide the incoming textual data into distinct lines.

    let totalRecipients = parseInt(parsedLines[0].split(' ')[0], 10); // Extract the total number of individuals from the first line, first segment.
 let overallSupply = parseInt(parsedLines[0].split(' ')[1], 10); // Extract the total available supply from the first line, second segment.

    let recipientRequests = parsedLines[1].split(' ').map(Number); // Obtain an array of individual demand quantities from the second line, converting to numbers.

 // The primary objective is to satisfy as many requests as possible,
 // prioritizing those with smaller demands, until the total supply is exhausted.

 // Arrange the individual requests in ascending numerical order.
 recipientRequests.sort(function(valA, valB)
 {
  return valA - valB; // Standard ascending sort for numeric values.
 });


 let currentAllocation = 0; // Initialize an accumulator for the quantity of resources currently distributed.
    for (let personIdx = 0; personIdx < totalRecipients; personIdx++) { // Iterate through the sorted requests, attempting to fulfill them.
  fulfilledRecipients = personIdx; // Keep track of how many individuals have been served in this iteration.
  currentAllocation += recipientRequests[personIdx]; // Add the current individual's request to the distributed total.

  // Check if the accumulated allocation has now surpassed the available overall supply.
  if (currentAllocation > overallSupply) {
   console.log(fulfilledRecipients); // If supply is exceeded, output the count of individuals served *before* this last one.
   break; // Terminate the distribution process as supply is insufficient for further requests.
  }

    }

 // After the loop, either due to break or completion, display the final count
 // of individuals whose requests could be fully met within the available supply.
 console.log(fulfilledRecipients);

}
handleResourceDistribution(require('fs').readFileSync('/dev/stdin', 'utf8'));