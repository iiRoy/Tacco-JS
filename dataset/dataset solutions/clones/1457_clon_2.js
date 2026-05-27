process.stdin.on(
  "data",
  function (receivedData) {
    // Convert the incoming data buffer to a string and remove leading/trailing whitespace.
    const cleanedInput = (receivedData + "").trim();

    // Extract the second line from the cleaned input string.
    const relevantLine = cleanedInput.split("\n")[1];

    // Split the relevant line by spaces, sort the resulting array lexicographically,
    // and then re-join the elements with a single space.
    const finalResult = relevantLine.split(" ").sort().join(" ");

    // Output the processed string to the standard output.
    console.log(finalResult);
  }
).resume(); // Keep the input stream active to receive data.
