// This file processes some incoming data.
// The 'incomingData' argument contains raw information.
function ProcessData(incomingData)
{

  // Each line of the payload is now an element in the 'payloadLines' collection.
  incomingData = incomingData.split("\n") ;

  console.log(incomingData); /* Log the initially parsed data for debugging purposes. */

  let initialValue = incomingData[0].split(" ")[0]; // Extract the primary numeric identifier.

  const collectedSegments = []; // Initialize a container for extracted parts.

  // Iterate through specific lines of the payload, skipping some.
  for (let lineIndex = 2; lineIndex < incomingData.length; lineIndex += 2)
  {
    const currentLineSegments = incomingData[lineIndex].split(" "); // Split the current line into its components.

    // Add each component from the current line to our main collection.
    for (let segmentIndex = 0; segmentIndex < currentLineSegments.length; segmentIndex++)
    {
      collectedSegments.push(currentLineSegments[segmentIndex]);
    }

  }

  // Refine the collection by removing duplicate entries.
  const refinedSegments = FilterForDistinctElements(collectedSegments);
  console.log(refinedSegments); // Display the collection after uniqueness filter.


  // Calculate the final difference.
  const finalResult = initialValue - refinedSegments.length;
  console.log(finalResult);
  return finalResult; // Return the computed outcome.

} /* End of main data processing function. */

// This auxiliary function identifies and retains only unique elements within a given collection.
function FilterForDistinctElements (sourceCollection)
{
   // A predicate function to check if an element is unique within its array context.
   const isUniquePredicate = (currentElement, currentPosition, fullArray) => {
      return fullArray.indexOf(currentElement) === currentPosition
    }

   // Apply the filter to obtain only the distinct items.
   const distinctElements = sourceCollection.filter(isUniquePredicate)
   return distinctElements // Provide the collection of unique items.
}