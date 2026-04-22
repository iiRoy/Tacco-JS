const fileContentLines = require('node:fs')
  .readFileSync('/dev/stdin', 'utf-8')
  .trim()
  .split('\n');

const totalEntries = Number.parseInt(fileContentLines.shift(), 10);

let numericElements = fileContentLines.shift()
  .split(' ')
  .map(item => Number.parseInt(item, 10));

for ( let mainIterator = 0; mainIterator < numericElements.length; mainIterator++ )
{
  let elementToInsert = numericElements[mainIterator];

  let scanIterator = mainIterator - 1;

  while ( scanIterator >= 0 && numericElements[scanIterator] > elementToInsert )
  {
    numericElements[scanIterator + 1] = numericElements[scanIterator];
    scanIterator--;
  }

  numericElements[scanIterator + 1] = elementToInsert;

  console.log( numericElements.join(' ') );
}