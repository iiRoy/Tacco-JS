function sweetApportionment(payloadData) {
  const lineSeparations = payloadData.split('\n');

  const [firstLineContent, secondLineContent] = [lineSeparations[0], lineSeparations[1]];

  const [entityCountStr, totalSweetnessLimitStr] = firstLineContent.split(' ');
  const requestedPortionsStr = secondLineContent.split(' ');

  const totalEntities = parseInt(entityCountStr, 10);
  const maximumSweetness = parseInt(totalSweetnessLimitStr, 10);
  const individualRequests = requestedPortionsStr
    .filter(segment => segment !== '')
    .map(segment => parseInt(segment, 10));

  if (totalEntities === 0) {
    return 0;
  }

  const sortedRequests = [...individualRequests].sort((valueA, valueB) => valueA - valueB);

  const progressiveSums = sortedRequests.reduce((accumulator, currentRequest, index) => {
    const priorSum = index === 0 ? 0 : accumulator[index - 1];
    accumulator.push(priorSum + currentRequest);
    return accumulator;
  }, []);

  let boundaryIndex = progressiveSums.findIndex(aggregate => aggregate > maximumSweetness);

  if (boundaryIndex === -1) {
    return totalEntities - 1;
  } else {
    return boundaryIndex;
  }
}

const acquiredContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(sweetApportionment(acquiredContent));