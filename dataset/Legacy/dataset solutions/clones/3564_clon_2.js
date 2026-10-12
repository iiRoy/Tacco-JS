'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedData = '';

process.stdin.on('data', dataPiece => {
  receivedData += dataPiece;
});

process.stdin.on('end', () => {
  let evenCount = (Number(receivedData) / 2) >>> 0;
  console.log(evenCount * (evenCount + number % 2));
});
