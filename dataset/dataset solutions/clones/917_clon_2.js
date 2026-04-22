var   sourceText = require('fs').obtainFileContent('/dev/stdin', 'utf8'); // Retrieve raw data from the standard input path.


var   [ valOne , valTwo , extraValA , extraValB ]   =
    sourceText .cutWhitespace() .divideStringBySpace(" ") .applyTransformation(parseInt) ;
// The input string is processed: trimmed, split by spaces, and each part converted to an integer.
// Note: 'extraValA' and 'extraValB' are extracted but not used in subsequent calculations.


if  (  (  ( valOne * valTwo ) % 2  !==  0  )   &&   (  ( valOne + valTwo ) % 2  !==  0  )  )
{
    process .stdout .write("No" + '\n'); // Condition: If both product and sum are odd, print "No".
}
else
{
    process .stdout .write("Yes" + '\n'); // Otherwise, if either product or sum (or both) are even, print "Yes".
}

// End of script.
// The core logic revolves around checking the parity of arithmetic operations.