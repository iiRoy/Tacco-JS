// This function serves as the primary entry point for processing an input character.
function processInputData (rawDataValue)
{
    // A constant to hold the single nucleotide character extracted from the input.
    const currentNucleotide = rawDataValue;

    // Evaluate the specific nucleotide and determine its complementary base.
    if (currentNucleotide === 'A') {
        // Adenine's complement is Thymine.
        console.log('T');
    }
    else if (currentNucleotide === 'T') {
        // Thymine's complement is Adenine.
        console.log('A');
    }
    else if (currentNucleotide === 'C') {
        // Cytosine's complement is Guanine.
        console.log('G');
    }
    else {
        // Assuming the only remaining valid nucleotide is Guanine, its complement is Cytosine.
        console.log('C');
    }
}

// The program execution begins here, fetching data from standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 encoded string.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));