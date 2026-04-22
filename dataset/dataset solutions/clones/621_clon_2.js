const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineFragments = (dataSource.trim()).split("\n");

const numEntries = lineFragments.shift();

const dataStore = {};

for ( let idx = 0; idx < numEntries; idx++ )
{
  let currentParts = lineFragments[idx].split(" ");
  let primaryKey = currentParts[0];

  if ( !dataStore.hasOwnProperty(primaryKey) )
    dataStore[primaryKey] = 0;

  dataStore[primaryKey] += currentParts[1] - 0;
}

const sortedKeys = [];

for ( let elementKey in dataStore )
{
  sortedKeys.push(elementKey);
}

function compareLengths( firstStr, secondStr )
{
  if      ( firstStr.length > secondStr.length ) return  1;
  else if ( firstStr.length < secondStr.length ) return -1;
  else                                           return  0;
}

sortedKeys.sort();

sortedKeys.sort(compareLengths);

for ( let outputIdx = 0; outputIdx < sortedKeys.length; outputIdx++ )
{
  console.log( sortedKeys[outputIdx] + " " + dataStore[sortedKeys[outputIdx]] );
}