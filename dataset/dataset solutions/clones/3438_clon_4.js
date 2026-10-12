function produceOppositeDigitOrder(value) {
    const magnitude = Math.abs(value);

    const transformedValue = Number(
        String(magnitude)
            .split("")
            .reverse()
            .join("")
    );

    return Math.sign(value) * transformedValue;
}