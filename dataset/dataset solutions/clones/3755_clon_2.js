// Function to handle the primary data processing task.
function processDataStream(rawTextContent)
{
  // Split the incoming text into individual lines based on newline characters.
  const lineFragments = rawTextContent.split ( "\n" ) ;
  
  // Determine the count of items from the first line, converting it to an integer.
  const itemCount = parseInt( lineFragments[0] );
  
  // Parse the second line into an array of numbers, splitting by space.
  const numericValues = lineFragments[1].split(" ").map ( currentValue => parseInt(currentValue) ) ;

  // Initialize a counter for the division operations performed.
  let divisionCounter = 0 ;  
  
  // Iterate through each number in the collection.
  for ( let indexPos = 0 ; indexPos < itemCount ; indexPos++ )
  {
    // Continuously divide the current number by 2 as long as it's even.
    while ( numericValues[indexPos] % 2 === 0 )
    {
      numericValues[indexPos] = numericValues[indexPos] / 2 ; // Perform division.
      divisionCounter++ ; // Increment the counter for each successful division.
    }
  }
  
  // Output the total number of divisions performed.
  console.log( divisionCounter );
}

// Invoke the main processing function with content read from standard input.
processDataStream ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;