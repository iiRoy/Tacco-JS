function obtainDecimalLength(value) {
    const magnitude = Math.abs(value);

    return magnitude === 0
        ? 1
        : Math.floor(Math.log10(magnitude)) + 1;
}