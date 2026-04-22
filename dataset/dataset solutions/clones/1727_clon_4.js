function calculateBooks(shelfOneIndex, shelfTwoIndex, currentDuration, maxDurationLimit, bookCollectionOne, bookCollectionTwo) {
    if (currentDuration > maxDurationLimit) {
        return 0;
    }

    const hasMoreFromShelf1 = shelfOneIndex < bookCollectionOne.length;
    const hasMoreFromShelf2 = shelfTwoIndex < bookCollectionTwo.length;

    if (!hasMoreFromShelf1 && !hasMoreFromShelf2) {
        return 0;
    }

    let chosenBookTime = Infinity;
    let nextIndexForShelf1 = shelfOneIndex;
    let nextIndexForShelf2 = shelfTwoIndex;

    if (hasMoreFromShelf1 && hasMoreFromShelf2) {
        const timeFromShelf1 = bookCollectionOne[shelfOneIndex];
        const timeFromShelf2 = bookCollectionTwo[shelfTwoIndex];

        if (timeFromShelf1 <= timeFromShelf2) {
            chosenBookTime = timeFromShelf1;
            nextIndexForShelf1++;
        } else {
            chosenBookTime = timeFromShelf2;
            nextIndexForShelf2++;
        }
    } else if (hasMoreFromShelf1) {
        chosenBookTime = bookCollectionOne[shelfOneIndex];
        nextIndexForShelf1++;
    } else { // hasMoreFromShelf2
        chosenBookTime = bookCollectionTwo[shelfTwoIndex];
        nextIndexForShelf2++;
    }

    if (currentDuration + chosenBookTime > maxDurationLimit) {
        return 0;
    }

    return 1 + calculateBooks(nextIndexForShelf1, nextIndexForShelf2, currentDuration + chosenBookTime, maxDurationLimit, bookCollectionOne, bookCollectionTwo);
}

function processBookData(textualInput) {
    const lines = textualInput.split('\n');
    const parameters = lines[0].split(' ').map(Number);
    const timeAllowance = parameters[2];

    const shelfAItems = lines[1].split(' ').map(Number);
    const shelfBItems = lines[2].split(' ').map(Number);

    const totalReadings = calculateBooks(0, 0, 0, timeAllowance, shelfAItems, shelfBItems);

    console.log(totalReadings);
}

processBookData(require('fs').readFileSync('/dev/stdin', 'utf8'));