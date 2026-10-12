function measureIncreasingSequence(collection) {
    const smallestTails = [];

    for (const value of collection) {
        let left = 0;
        let right = smallestTails.length;

        while (left < right) {
            const middle = Math.floor((left + right) / 2);

            if (smallestTails[middle] < value) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }

        smallestTails[left] = value;
    }

    return smallestTails.length;
}

const collection = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(measureIncreasingSequence(collection));