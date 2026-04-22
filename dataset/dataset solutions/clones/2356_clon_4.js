function processData(rawInput) {
    const lines = rawInput.split('\n');
    const quantity = Number(lines[0]);
    const numericalValues = lines[1].split(' ').map(Number);

    let accumulator = 0;
    const modulusFactor = 1000000007;

    const maxBitIndex = 30;

    for (let bitPosition = 0; bitPosition <= maxBitIndex; ++bitPosition) {
        let zeroCount = 0;
        let oneCount = 0;

        for (const currentValue of numericalValues) {
            if ((currentValue >> bitPosition) & 1) {
                oneCount++;
            } else {
                zeroCount++;
            }
        }

        let powerOfTwoComponent = (1 << bitPosition) % modulusFactor;
        let productOfCountsComponent = (zeroCount % modulusFactor * oneCount % modulusFactor) % modulusFactor;
        
        let currentBitContribution = (productOfCountsComponent * powerOfTwoComponent) % modulusFactor;

        accumulator = (accumulator + currentBitContribution) % modulusFactor;
    }

    console.log(accumulator);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));