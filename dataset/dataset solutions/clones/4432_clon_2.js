let parsedContent = require('fs')
                          .readFileSync('/dev/stdin', 'utf8')
                          .split('\n')[0]
                          .split(' ');

let dimX = +parsedContent.shift();

let dimY = +parsedContent.shift();

console.log((dimX - 1) * (dimY - 1));