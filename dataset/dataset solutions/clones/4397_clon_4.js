function ProcessStream(txtStream) {
  let encounteredSymbols = new Map();
  let lowestSymbol = String.fromCharCode(255); // Initialize with a char code higher than any common char
  let currentSymbol;

  // Iterate through the input stream to record unique symbols and identify the one with the smallest ASCII value.
  for (let idx = 0; idx < txtStream.length; ++idx) {
    currentSymbol = txtStream[idx];
    encounteredSymbols.set(currentSymbol, true); // Mark the symbol as encountered
    if (currentSymbol.charCodeAt(0) < lowestSymbol.charCodeAt(0)) {
      lowestSymbol = currentSymbol; // Update the lowest symbol found so far
    }
  }

  // If the input stream was not empty, remove the smallest encountered symbol from our collection.
  // If the stream was empty, lowestSymbol remains its initial high value, and this operation does nothing to an empty map.
  if (txtStream.length > 0) {
    encounteredSymbols.delete(lowestSymbol);
  }

  let resultGlyph = null;
  const startAscii = 'a'.charCodeAt(0);
  const endAscii = 'z'.charCodeAt(0);

  // Iterate through all lowercase English alphabet characters by their ASCII codes.
  // The goal is to find the first character that is not present in our modified collection of encountered symbols.
  for (let charCodeIter = startAscii; charCodeIter <= endAscii; ++charCodeIter) {
    let checkedGlyph = String.fromCharCode(charCodeIter);
    if (!encounteredSymbols.has(checkedGlyph)) {
      resultGlyph = checkedGlyph; // This is the first missing alphabet character
      break; // Exit the loop as soon as the first missing character is found
    }
  }

  // Output the determined glyph or 'None' if no such glyph was found.
  // (Based on analysis, resultGlyph will almost always be found unless the input contains non-alphabetical chars and fills the map for alphabet chars, which is unlikely given the `delete` operation)
  if (resultGlyph === null) {
    console.log('None');
  } else {
    console.log(resultGlyph);
  }
}

ProcessStream(require("node:fs").readFileSync("/dev/stdin", "utf8"));