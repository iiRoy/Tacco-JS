// Function to handle the primary processing of input data
function Processor (  dataStream  ) {
  "use strict"; // Enforce strict parsing and error handling for cleaner code.

  // Split the entire input string by newline characters to get individual lines.
  const rawData = dataStream.split ( "\n" );

  // Extract the first line. This forms the initial sequence of elements,
  // where the first line itself is treated as a single element in an array.
  const elementCollection = [ rawData.shift ( ) ];
  
  // Retrieve the second line, parsing it as an integer with radix 10 to determine
  // the total number of subsequent operations.
  const operationCount = Number.parseInt ( rawData.shift ( ) , 10 );

  // Process the remaining lines, mapping each into an array of strings
  // by splitting them at space characters. These are the actual operations.
  const operationList = rawData.map (  ( currentOpLine )  =>  currentOpLine.split ( " " )  );
  
  // Initialize a state variable to track the current orientation (normal or reversed).
  // A value of 0 indicates normal, 1 indicates reversed.
  let orientationState = 0;

  // Iterate through each defined operation in the list.
  operationList.forEach (  ( currentOperation )  =>  {
    // Check if the current operation is a "flip" command (indicated by a single element).
    if (  currentOperation.length  ===  1  )  {
      // Toggle the orientation state using modulo 2 arithmetic.
      orientationState = ( orientationState + 1 ) % 2;
    }
    // Otherwise, it's an "add" command (indicated by multiple elements).
    else  {
      // Determine the effective direction based on the current orientation state
      // and the second parameter of the operation (which can also toggle the effect).
      // If the sum of orientationState and the parsed second parameter (modulo 2) is even,
      // the element should be appended to the collection.
      if (  ( orientationState  +  Number.parseInt ( currentOperation[1] )  %  2  )  ===  0  )  {
        elementCollection.push ( currentOperation[2] ); // Add the third element to the end.
      }
      // If the condition is not met, the element should be prepended to the collection.
      else  {
        elementCollection.unshift ( currentOperation[2] ); // Add the third element to the beginning.
      }
    }
  }  ); // End of operations processing loop.
  
  // After all operations have been executed, check the final orientation state.
  if (  orientationState  )  {
    // If the state is reversed, reverse the collection of elements and then join them
    // into a single string for output to the console.
    console.log (  elementCollection.reverse ( ).join ( "" )  );
  }
  else  {
    // If the state is normal, simply join the elements into a string for output.
    console.log (  elementCollection.join ( "" )  );
  }
}

// --- Standard Input/Output Handling ---
// This section reads the entire content from standard input and passes it
// to the main processing function. Do not modify below this line.
Processor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );