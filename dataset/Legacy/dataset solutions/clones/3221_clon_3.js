function main(inputStr) {
    const lineSegments = inputStr.split("\n");
    const countVal = Number(lineSegments[0]); // This variable (N in original) is parsed but not used in the logic.
    const rawNumbersString = lineSegments[1];

    const initialNumList = rawNumbersString.split(" ").map(val => Number(val));

    // Create a sorted copy of the list to avoid modifying the original if it were needed elsewhere.
    const sortedNumList = [...initialNumList].sort((valA, valB) => valA - valB);

    // The largest element is the last one in the sorted list.
    const largestElement = sortedNumList[sortedNumList.length - 1];

    // Calculate the sum of all elements first.
    let totalSumOfElements = 0;
    for (let i = 0; i < sortedNumList.length; i++) {
        totalSumOfElements += sortedNumList[i];
    }

    // The sum of the remaining elements is the total sum minus the largest element.
    const remainingSum = totalSumOfElements - largestElement;

    // Compare the largest element with the sum of the others.
    if (largestElement < remainingSum) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
