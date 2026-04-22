process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (dataPayload) {
  const segments = dataPayload.split(' ');

  const componentA = parseInt(segments[0], 10);
  const componentB = parseInt(segments[1], 10);
  const componentC = parseInt(segments[2], 10);

  let firstElement = componentA;
  let secondElement = componentB;
  let thirdElement = componentC;

  const orderComparator = (valX, valY) => {
    if (isNaN(valX) && isNaN(valY)) return 0;
    if (isNaN(valX)) return 1;
    if (isNaN(valY)) return -1;
    return valX - valY;
  };

  if (orderComparator(firstElement, secondElement) > 0) {
    [firstElement, secondElement] = [secondElement, firstElement];
  }
  if (orderComparator(secondElement, thirdElement) > 0) {
    [secondElement, thirdElement] = [thirdElement, secondElement];
  }
  if (orderComparator(firstElement, secondElement) > 0) {
    [firstElement, secondElement] = [secondElement, firstElement];
  }

  process.stdout.write(`${firstElement} ${secondElement} ${thirdElement}\n`);
});