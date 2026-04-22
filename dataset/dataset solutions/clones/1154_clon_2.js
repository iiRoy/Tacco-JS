let totalElements;
let parentNodes = [];
let nodeRanks = [];

function setupComponents()
{
  performIteration(totalElements, function(currentIdx)
  {
    parentNodes[currentIdx] = currentIdx;
    nodeRanks[currentIdx] = 0;
  }
);
}

function getComponentRoot(targetElement)
{
  if (parentNodes[targetElement] === targetElement)
  {
    return targetElement;
  }
  return (parentNodes[targetElement] = getComponentRoot(parentNodes[targetElement]));
}

function areInSameSet(elementA, elementB)
{
  return getComponentRoot(elementA) === getComponentRoot(elementB);
}

function mergeComponents(elementA, elementB)
{
  let rootOfA = getComponentRoot(elementA);
  let rootOfB = getComponentRoot(elementB);

  if (rootOfA === rootOfB)
  {
    return;
  }

  if (nodeRanks[rootOfA] > nodeRanks[rootOfB])
  {
    parentNodes[rootOfB] = rootOfA;
  }
  else
  {
    parentNodes[rootOfA] = rootOfB;
    if (nodeRanks[rootOfA] === nodeRanks[rootOfB])
    {
      nodeRanks[rootOfB]++;
    }
  }
}

function beginExecution()
{
  totalElements = retrieveToken();
  setupComponents();
  let totalOperations = retrieveToken();
  performIteration(totalOperations, function()
  {
    let operationCode = retrieveToken();
    let element1 = retrieveToken();
    let element2 = retrieveToken();
    if (operationCode === 0)
    {
      mergeComponents(element1, element2);
    }
    else
    {
      emitResult(+areInSameSet(element1, element2));
    }
  }
);
}
 
function performIteration(startIndex, endIndex, actionCallback)
{
  if (actionCallback === undefined)
  {
    actionCallback = endIndex;
    endIndex = startIndex;
    startIndex = 0;
  }
  for (let currentIdx = startIndex; currentIdx < endIndex; ++currentIdx)
  {
    if (actionCallback(currentIdx) === false)
    {
      break;
    }
  }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let completeInputBuffer = '';
let currentParseIndex = 0;
 
function retrieveToken(requestedType)
{
  if (requestedType === 'string')
  {
    return completeInputBuffer[currentParseIndex++];
  }
  else
  {
    return +completeInputBuffer[currentParseIndex++];
  }
}
 
function emitResult(valueToDisplay)
{
  console.log(valueToDisplay);
}
 
process.stdin.on('data', function(incomingChunk)
{
  completeInputBuffer += incomingChunk;
});
process.stdin.on('end', function()
{
  completeInputBuffer = completeInputBuffer.split(/\s+/);
  beginExecution();
});