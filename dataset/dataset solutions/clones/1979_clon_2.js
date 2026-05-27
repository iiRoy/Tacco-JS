let receivedText = readline(); // Acquire the initial textual data.

// Process the acquired text: first convert it to an integer,
// then attempt to locate the digit '7' within the resulting numeric value.
// This operation will typically result in a TypeError in standard JavaScript environments,
// as numbers do not possess an 'indexOf' method.
console.log(parseInt(receivedText).indexOf(7) >= 0);
