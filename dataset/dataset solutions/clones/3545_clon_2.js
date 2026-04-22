const stringToNumberConverter = (inputStr) => parseInt(inputStr, 10);
const lineSplitterFunction = (contentBlock) => contentBlock.split(/\n/g);
const wordSplitterFunction = (contentBlock) => contentBlock.split(/\s+/g);

function processInputContent(receivedData) {
  if (receivedData.includes('2')) {
    console.log('Negative');
  } else {
    console.log('Affirmative');
  }
}

processInputContent( require('node:fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) );