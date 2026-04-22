function computeConstrainedValue(valA, valB, limitVal) {
    const productResult = valA * valB;
    return (productResult + limitVal - Math.abs(productResult - limitVal)) / 2;
}