var rawInputBuffer = '';
var inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');
inputSource.on('data', function(chunkSegment) {
  rawInputBuffer += chunkSegment;
});

inputSource.on('end', function() {
  var lineSegments = rawInputBuffer.split('\n');
  var dimensionsString = lineSegments[0].split(' ');
  var rowCount = parseInt(dimensionsString[0]);
  var colCount = parseInt(dimensionsString[1]);
  
  var matrixElements = Array.from({ length: rowCount }, (_, rowIndex) => 
    lineSegments[rowIndex + 1].split(' ').map(Number)
  );
  
  var vectorComponents = Array.from({ length: colCount }, (_, colIndex) => 
    Number(lineSegments[rowCount + 1 + colIndex].split(' ')[0])
  );
  
  var resultVector = matrixElements.map(
    (currentRow) => currentRow.reduce(
      (accumulator, currentElement, elementIndex) => accumulator + currentElement * vectorComponents[elementIndex],
      0
    )
  );
  
  console.log(resultVector.join('\n'));
});
