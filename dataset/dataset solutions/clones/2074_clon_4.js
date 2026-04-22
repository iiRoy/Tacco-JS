function evaluateCondition(dataPacket) {
    const numericFragments = dataPacket.split(" ").map(segment => Number(segment));

    const X = numericFragments[0];
    const Y = numericFragments[1];
    const Z = numericFragments[2];

    const intermediateValue = Z - X - Y;

    const finalDecision = (intermediateValue > 0) && (intermediateValue * intermediateValue > 4 * X * Y)
        ? "Yes"
        : "No";

    console.log(finalDecision);
}