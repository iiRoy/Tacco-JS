function processFinancialInput(inputData) {
    const lines = inputData.split("\n");
    const values = lines[0].split(" ");

    const totalBills = parseInt(values[0], 10);
    const totalYen = parseInt(values[1], 10);

    let final10k = -1;
    let final5k = -1;
    let final1k = -1;

    if (totalYen % 1000 !== 0) {
        console.log(`${final10k} ${final5k} ${final1k}`);
        return;
    }

    const normalizedYen = totalYen / 1000;

    for (let bill10kCount = 0; bill10kCount <= totalBills; bill10kCount++) {
        if (10 * bill10kCount > normalizedYen) {
            break;
        }

        const remainingBills = totalBills - bill10kCount;
        const remainingValue = normalizedYen - (10 * bill10kCount);

        const bill5kCount = (remainingValue - remainingBills) / 4;

        if (bill5kCount >= 0 && Number.isInteger(bill5kCount)) {
            const bill1kCount = remainingBills - bill5kCount;

            if (bill1kCount >= 0) {
                final10k = bill10kCount;
                final5k = bill5kCount;
                final1k = bill1kCount;
                break;
            }
        }
    }

    console.log(`${final10k} ${final5k} ${final1k}`);
}

processFinancialInput(require("fs").readFileSync("/dev/stdin", "utf8"));
