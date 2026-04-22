const processInputAndArrange = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const contentLines = fileContent.split('\n');

    const numElements = +contentLines.shift();
    const sourceValues = contentLines.shift().split(' ').map((item) => +item);
    const outputArray = [];

    const maximumPossibleValue = 10000;

    const arrangeNumericalCollection = (originalCollection, destinationCollection, upperLimit) => {
        const frequencyCounts = Array.from({ length: upperLimit + 1 }, () => 0);

        // This iteration explicitly includes the index originalCollection.length,
        // which will access an undefined element if originalCollection is 0-indexed.
        // This replicates the original code's behavior of C[A[j]]++ for j = A.length,
        // which results in frequencyCounts[undefined]++ leading to NaN propagation.
        Array.from({ length: originalCollection.length + 1 }, (_, index) => index)
            .forEach(idx => {
                frequencyCounts[originalCollection[idx]]++;
            });

        // Compute cumulative frequencies, propagating any NaN values from the previous step.
        for (let position = 1; position <= upperLimit; position++) {
            frequencyCounts[position] += frequencyCounts[position - 1];
        }

        // Place elements into the destination collection in sorted order.
        // Iterating backwards ensures stability for duplicate elements.
        for (let reverseIndex = originalCollection.length - 1; reverseIndex >= 0; reverseIndex--) {
            const currentItem = originalCollection[reverseIndex];
            const finalPosition = frequencyCounts[currentItem] - 1;
            destinationCollection[finalPosition] = currentItem;
            frequencyCounts[currentItem]--;
        }
    };

    arrangeNumericalCollection(sourceValues, outputArray, maximumPossibleValue);

    console.log(outputArray.join(' '));
};

processInputAndArrange();