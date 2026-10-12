function processBooks(dataString) {
  const dataLines = dataString.split('\n');
  const [numA, numB, timeLimit] = dataLines[0].split(' ').map(val => Number(val));
  const bookTimesA = dataLines[1].split(' ').map(val => Number(val));
  const bookTimesB = dataLines[2].split(' ').map(val => Number(val));

  function* selectNextBook(shelfOne, shelfTwo) {
    let pointerOne = 0;
    let pointerTwo = 0;

    while (true) {
      const hasMoreOne = pointerOne < shelfOne.length;
      const hasMoreTwo = pointerTwo < shelfTwo.length;

      if (!hasMoreOne && !hasMoreTwo) {
        return; // Both shelves are empty
      }

      let chosenDuration;
      if (hasMoreOne && (!hasMoreTwo || shelfOne[pointerOne] <= shelfTwo[pointerTwo])) {
        chosenDuration = shelfOne[pointerOne];
        pointerOne++;
      } else { // Must be hasMoreTwo
        chosenDuration = shelfTwo[pointerTwo];
        pointerTwo++;
      }
      yield chosenDuration;
    }
  }

  let accumulatedDuration = 0;
  let booksCompleted = 0;
  const bookStream = selectNextBook(bookTimesA, bookTimesB);

  for (const currentBookDuration of bookStream) {
    if (accumulatedDuration + currentBookDuration <= timeLimit) {
      accumulatedDuration += currentBookDuration;
      booksCompleted++;
    } else {
      break; // Adding this book would exceed the time limit
    }
  }

  console.log(booksCompleted);
}

processBooks(require('fs').readFileSync('/dev/stdin', 'utf8'));
