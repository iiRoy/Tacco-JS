let initialSymbol = 'A';

let receivedSegments = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
  receivedSegments.push(dataSegment.trim());
});

process.stdin.on('end', function() {
  let finalSymbol = receivedSegments.reduce((accumulatorSymbol, currentSegment) => {
    let parsedElements = currentSegment.split(',');
    let firstElement = parsedElements[0];
    let secondElement = parsedElements[1];

    return (firstElement === accumulatorSymbol)
             ? secondElement
             : (secondElement === accumulatorSymbol)
               ? firstElement
               : accumulatorSymbol;

  }, initialSymbol);

  console.log(finalSymbol);
});
