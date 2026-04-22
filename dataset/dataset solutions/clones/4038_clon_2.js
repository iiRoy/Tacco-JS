const TestMode = function () {
 const fetchInput = function (promptMessage) {
        return `5
        3 1 4 1 5
        2 7 1 8 2
        `.replace( /^\t+/g, '' )
         .replace( /^\n$/, '' );
 };

 return fetchInput;
};


const ProdMode = function () {
 const fileSystemModule = require('fs');
 const fetchInput = function (promptMessage) {
  if ( promptMessage ) console.log(promptMessage);
  return fileSystemModule.readFileSync( '/dev/stdin', 'utf8' );
 }
 return fetchInput;
};


const isTestingActive = false;

const dataStream = isTestingActive ? TestMode() : ProdMode();
const rawLines = dataStream().split('\n');

const totalElements = parseInt( rawLines[0] );
const firstSet = rawLines[1].split(' ').map( (elementStr) => parseInt(elementStr) ).sort();
const secondSet = rawLines[2].split(' ').map( (elementStr) => parseInt(elementStr) ).sort();

const modifyEntries = function (idxOne, idxTwo) {
 firstSet[idxOne] += 2; secondSet[idxTwo] += 1;
};

var underflowSum = 0;
var overflowSum = 0;
for ( var currentIdx = 0; currentIdx < totalElements; currentIdx++ ) {
 if ( secondSet[currentIdx] < firstSet[currentIdx] ) {
  underflowSum += ( firstSet[currentIdx] - secondSet[currentIdx] );
 } else if ( secondSet[currentIdx] > firstSet[currentIdx] ) {
  overflowSum += Math.floor( ( secondSet[currentIdx] - firstSet[currentIdx] ) / 2 );
 }
}

console.log( overflowSum >= underflowSum ? 'Yes' : 'No' );