function processSequence(sourceText) {
    const obtainLines = (multilineString) => {
        const lineArray = multilineString.split(/\r?\n/).filter(line => line.length > 0);
        let currentIdx = 0;
        return {
            pull: () => (currentIdx < lineArray.length ? lineArray[currentIdx++] : undefined)
        };
    };

    const lineSupplier = obtainLines(sourceText);
    let currentCommand;

    for (;;) {
        currentCommand = lineSupplier.pull();
        if (currentCommand === undefined) {
            break;
        }

        const dimensions = currentCommand.split(" ").map(Number);
        const dimensionA = dimensions[0];
        const dimensionB = dimensions[1];

        if (dimensionA === 0 && dimensionB === 0) {
            break;
        }

        const collectionA = Array.from({ length: dimensionA }, () => Number(lineSupplier.pull()));
        const sumA = collectionA.reduce((accumulator, item) => accumulator + item, 0);

        const collectionB = Array.from({ length: dimensionB }, () => Number(lineSupplier.pull()));
        const sumB = collectionB.reduce((accumulator, item) => accumulator + item, 0);

        if ((sumA + sumB) % 2 !== 0) {
            console.log("-1");
            continue;
        }

        const requiredBalance = (sumA - sumB) / 2;

        const lookupB = new Set(collectionB);

        let pairLocated = false;
        for (const elementA of collectionA) {
            const desiredElementB = elementA - requiredBalance;
            if (lookupB.has(desiredElementB)) {
                console.log(`${elementA} ${desiredElementB}`);
                pairLocated = true;
                break;
            }
        }

        if (!pairLocated) {
            console.log("-1");
        }
    }
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));