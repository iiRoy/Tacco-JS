function calculateUniqueOverlap(leftCollection, rightCollection) {
    const availableValues = new Set(rightCollection);
    const uniqueLeftValues = [...new Set(leftCollection)];

    return uniqueLeftValues.filter(
        value => availableValues.has(value)
    );
}