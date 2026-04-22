function acquireSourceData(){return require('node:fs').readFileSync(0, 'utf8').trim();}
function displayResult(param){process.stdout.write(param + '\n');}
function segmentLines(text){return text.split('\n');}
function parseInteger(text){return Number.parseInt(text, 10);}
function parseNumericSequence(text){return text.split(/\s+/).map(Number);}
function processComputation(dataAcquired){
  const dataLines = segmentLines(dataAcquired);
  const quantityValue = parseInteger(dataLines[0]);
  const numberCollection = parseNumericSequence(dataLines[1]);
  const baseCalculation = 3 ** quantityValue;
  const evenFactor = numberCollection.reduce((accumulator, currentNumber) => {
    return accumulator * (currentNumber % 2 === 0 ? 2 : 1);
  }, 1);
  displayResult(baseCalculation - evenFactor);
}
processComputation(acquireSourceData());