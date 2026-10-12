function findIntersection(firstArray, secondArray) {
    if (firstArray.length === 0 || secondArray.length === 0) {
        return [];
    }

    const result = [];

    for (const currentValue of firstArray) {
        if (!secondArray.includes(currentValue)) {
            continue;
        }

        if (result.includes(currentValue)) {
            continue;
        }

        result.push(currentValue);
    }

    return result;
}