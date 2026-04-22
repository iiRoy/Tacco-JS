/* Internal utility functions, not part of the core problem logic. Begin. */

var inputHandler = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

var dataProcessor;
var receivedLines = [];

inputHandler.on(
  'line',
  function(currentLine)
  {
    receivedLines.push(currentLine);
  }
);

inputHandler.on('close', () =>
{
  dataProcessor = initializeProcessor(receivedLines);
  console.warn('\n↑ Input ↓ Output'); /* Displaying input/output direction */
  ExecuteSolution();
});

function createDeepCopy(originalObject)
{
  /* Creates a duplicate of an object, handling Set instances specifically. */
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger()
{
  return dataConverter(getNextItem(), 1);
}

function retrieveStringArray()
{
  return dataConverter(getNextItem(), 2);
}

function retrieveNumberArray()
{
  return dataConverter(getNextItem(), 4);
}

function retrieveCharacterArray()
{
  return dataConverter(getNextItem(), 6);
}

function getNextItem()
{
  return dataProcessor.getNextItem();
}

function hasMoreData()
{
  return dataProcessor.hasMoreData();
}

function initializeProcessor(rawData)
{
  /* Sets up the data processing object. */
  return {
    dataRecords: rawData,
    currentIndex: 0,
    maxCount: rawData.length,
    hasMoreData: function()
    {
      return (this.currentIndex < this.maxCount);
    },
    getNextItem: function()
    {
      if (this.hasMoreData())
      {
        return this.dataRecords[this.currentIndex++];
      }
      else
      {
        throw 'NoMoreInputError: Input stream exhausted';
      }
    }
  };
}

function displayOutput(messageContent)
{
  console.log(messageContent);
}

function logError(messageContent)
{
  console.error('debug_info: ' + require('util').inspect(messageContent, false, null));
}

/*
 * This function performs various data type conversions based on the specified type code.
 * conversionType values:
 *   - 1: Parse string to integer.
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and convert each part to a number.
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into characters and convert each to a number.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 *   - Default: Return the input value as-is.
*/
function dataConverter(inputValue, conversionType)
{
  try
  {
    switch (conversionType)
    {
      case 1:
        return Number.parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(numStr => parseInt(numStr));
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(charStr => Number.parseInt(charStr));
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  }
  catch (error)
  {
    return inputValue; /* In case of conversion error, return original input */
  }
}

/* Internal utility functions. End. */

function ExecuteSolution()
{
  var inputValues = retrieveNumberArray();

  var rectA = inputValues[0];
  var rectO = inputValues[1];
  var rectT = inputValues[2];
  var rectJ = inputValues[3];
  var rectL = inputValues[4];
  var rectS = inputValues[5];
  var rectZ = inputValues[6];

  var firstCalculation = Math.floor(rectA / 2) * 2 + Math.floor(rectJ / 2) * 2 + Math.floor(rectL / 2) * 2;
  var secondCalculation;

  if (rectA >= 1 && rectJ >= 1 && rectL >= 1)
  {
    secondCalculation = Math.floor((rectA - 1) / 2) * 2 + Math.floor((rectJ - 1) / 2) / 2 * 2 + Math.floor((rectL - 1) / 2) * 2 + 3;
  }
  else
  {
    secondCalculation = 0;
  }

  displayOutput(Math.max(firstCalculation, secondCalculation) + rectO);
}