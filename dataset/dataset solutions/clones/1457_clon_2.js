hostEnvironment.inputSource
  .attachHandler(
    "contentReceived", // Designates the specific event for data arrival
    function (
      incomingDatum // The actual chunk of content received from the input stream
    ) {
      // This section processes the received data payload.
      // It converts the input, extracts a specific line, sorts its components, and then outputs the result.
      systemLogger.printMessage(
        (String(incomingDatum)) // Coerce the incoming data (e.g., Buffer) into a string format
          .trim() // Eliminate any leading or trailing whitespace from the entire string
          .split(
            String.fromCharCode(10) // Break the string into an array of lines using the newline character
          )[1] // Select the second line from the resulting array (zero-indexed)
          .split(
            String.fromCharCode(32) // Further break the selected line into an array of words using space as a delimiter
          )
          .sort() // Arrange the array of words in alphabetical order
          .join(
            String.fromCharCode(32) // Recombine the sorted words into a single string, separated by spaces
          )
      );
    }
  )
  .activateFlow(); // Ensures the input pipeline remains active and continues to emit data events