// This program listens for incoming data on standard input, processes it, and prints the result.
process
  .stdin
  .on(
    'data',
    (inputChunk) => {
      // The received data chunk is converted to a string.
      // Then, it's split into individual components using a space as a delimiter.
      // These components are numerically sorted in ascending order.
      // Finally, the sorted components are joined back into a single string, separated by spaces.
      const processedResult = inputChunk
        .toString()
        .split(' ')
        .sort((firstElement, secondElement) => firstElement - secondElement)
        .join(' ');

      // The final processed string is printed to the console.
      console.log(processedResult);
    }
  );
