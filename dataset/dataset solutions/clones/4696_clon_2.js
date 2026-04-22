'use strict';

const   sourceData   =   require('fs').readFileSync('/dev/stdin',    'utf8' )
                                     .trim(  )
                                     .split('\n');
// Obtain the numerical value present on the first provided line
let     upperBoundary = sourceData * 1   ;
let currentResult = 1;
let divisorValue = Math.pow(10, 9) + 7;

for    ( let loopIndex = 1 ; loopIndex <= upperBoundary ; loopIndex++ )
{
    currentResult *= loopIndex;
    if  ( currentResult > divisorValue )
    {
        currentResult = currentResult % divisorValue;
    }
}

console.log(currentResult);