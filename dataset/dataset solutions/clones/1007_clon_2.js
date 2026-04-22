var rawData = "";

process.stdin.  on  (  'data'  , incomingDataChunk => { rawData += incomingDataChunk; }  );
process.stdin.on('end', function()   {
    rawData = rawData.replace(/\s*$/, '')
        .split('\n')
        .map(lineFragment => lineFragment.replace(/\s*$/, ''));

    orderElements(rawData[1].split(' ').map(lineFragment => Number(lineFragment)));
});

const orderElements = (numericArray) => {
  let exchangeCount = 0;

  for ( let outerIndex = 0 ; outerIndex < numericArray.length ; outerIndex++ ) {
    let minimumValueIndex = outerIndex;
    for ( let innerIndex = outerIndex ; innerIndex < numericArray.length ; innerIndex++ ) {
      if ( numericArray[innerIndex] < numericArray[minimumValueIndex] ) { minimumValueIndex = innerIndex; }
    }
    const firstElement = numericArray[outerIndex];
    const secondElement = numericArray[minimumValueIndex];
    if ( firstElement !== secondElement ) {
      numericArray[minimumValueIndex] = firstElement;
      numericArray[outerIndex] = secondElement;
      exchangeCount++;
    }
  }

  console.log(numericArray.join(' '));
  console.log(exchangeCount);
};