function findIntersection(firstArray, secondArray) {
    const result = [];

    for (let i = 0; i < firstArray.length; i++) {
        if (
            secondArray.includes(firstArray[i]) &&
            !result.includes(firstArray[i])
        ) {
            result.push(firstArray[i]);
        }
    }

    return result;
}