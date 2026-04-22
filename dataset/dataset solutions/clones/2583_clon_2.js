const fileContent = require('fs') .readFileSync ('/dev/stdin', 'utf8') ;

const contentLines = fileContent .split ('\n') ;

const initialLineSegments = contentLines .shift() .split (' ') ;

const totalItems = Number (initialLineSegments [0]) ;

const allowedModifications = Number (initialLineSegments [1]) ;

const mainString = contentLines .shift() ;

let disparityCount = 0 ;

let lastSeenChar = mainString [0] ;

for ( let charIndex = 1; charIndex < totalItems; charIndex++ ) {
  if (lastSeenChar !== mainString [charIndex]) {
    disparityCount++ ;
    lastSeenChar = mainString [charIndex] ;
  }
}

let adjustmentValue = disparityCount - (2 * allowedModifications) ;

if (adjustmentValue < 1) {
  adjustmentValue = 0 ;
}

console .log (totalItems - 1 - adjustmentValue) ;