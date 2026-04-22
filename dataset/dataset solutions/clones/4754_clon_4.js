function evaluateExpression(rawInput) {
    const [firstTerm, secondTerm, thirdTerm, fourthTerm] = rawInput.split(' ').map(Number);

    const productA = firstTerm * secondTerm;
    const productB = thirdTerm * fourthTerm;

    const allProducts = [productA, productB];

    const ultimateOutcome = allProducts.reduce((currentMax, element) => {
        return Math.max(currentMax, element);
    });

    console.log(ultimateOutcome);
}

evaluateExpression(process.stdin.readFileSync(0, 'utf8'));