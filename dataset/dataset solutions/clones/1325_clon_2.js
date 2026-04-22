let accumulatedInput = ''; // Variable to store all incoming data

process
  .stdin
  .resume(); // Activate standard input stream

process
  .stdin
  .setEncoding('utf8'); // Configure input encoding to UTF-8

process
  .stdin
  .on(
    'data',
    ( incomingChunk ) =>
    {
      accumulatedInput += incomingChunk;
    }
  ); // Attach a listener for data events

process
  .stdin
  .on(
    'end',
    () =>
    {
      // Once all input has been received, process it
      let [ currentWorkingSequence, ...parsedInputLines ] = accumulatedInput
        .trim()
        .split('\n');

      const finalOutputList = []; // Collection for the final results

      for
      (
        let loopCounter = 1;
        loopCounter < parsedInputLines.length;
        loopCounter++
      )
      {
        const rotationAmount = parseInt( parsedInputLines[ loopCounter ], 10 ); // Attempt to parse an integer from the line

        if
        (
          !isNaN( rotationAmount ) // Check if the parsed value is a valid number
        )
        {
          currentWorkingSequence = performCyclicShift( currentWorkingSequence, rotationAmount ); // Apply the cyclic shift operation
        }
        else
        {
          finalOutputList.push( currentWorkingSequence ); // Add the current sequence to the results
          currentWorkingSequence = parsedInputLines[ loopCounter ]; // Set the current line as the new working sequence
          loopCounter++; // Increment the counter to skip the line just assigned
        }
      }

      console.log( finalOutputList.join('\n') ); // Print the collected results, separated by newlines
    }
  );


const performCyclicShift = ( sourceString, shiftFactor ) =>
  sourceString.slice( shiftFactor ) + sourceString.slice( 0, shiftFactor ); // Utility function for string rotation