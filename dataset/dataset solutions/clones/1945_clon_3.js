const processInput = rawData => {
  const NEWLINE_DELIMITER = '\n';
  const allInputLines = rawData.split(NEWLINE_DELIMITER);
  
  const firstLineString = allInputLines[0];
  const totalItemsExpected = Number(firstLineString);
  
  const dataStringCollection = allInputLines.slice(1);
  
  const distinctElements = new Set();
  
  for (let i = 0; i < dataStringCollection.length; i++) {
    const currentItem = dataStringCollection[i];
    distinctElements.add(currentItem);
  }
  
  console.log(distinctElements.size);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
