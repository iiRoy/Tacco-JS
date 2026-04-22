const   incomingText = require(  'fs'  ) .  readFileSync(    '/dev/stdin'  ,  'utf8'  ) ; // Acquire raw text from standard input.

const   numericParts = incomingText.split(   ' '    ) ; // Tokenize the input string by spaces.

console.log(     Number(  numericParts[0] )   +    Number(  numericParts[1]  )   /   2    ) ; // Calculate and display the sum of the first part and half of the second part.