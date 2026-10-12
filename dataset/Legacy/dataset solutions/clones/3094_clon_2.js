function processInput(rawData) {
  // This function processes a single character input
  // and outputs its complementary base in DNA.

  const charSequence = rawData; // Store the input character

  // Check the character and print its complement
  if (charSequence === 'A') {
    console.log('T'); // Adenine's complement is Thymine
  } else if (charSequence === 'T') {
    console.log('A'); // Thymine's complement is Adenine
  } else if (charSequence === 'C') {
    console.log('G'); // Cytosine's complement is Guanine
  } else {
    // If it's not A, T, or C, it must be G (based on problem context)
    console.log('C'); // Guanine's complement is Cytosine
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
