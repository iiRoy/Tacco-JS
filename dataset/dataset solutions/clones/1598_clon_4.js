const processData = (dataSource) => {
    const characterArray = Array.from(dataSource.split('\n')[1]);

    const generateIndexCombinations = (totalLength, comboSize) => {
        const results = [];
        const recurse = (currentCombo, start) => {
            if (currentCombo.length === comboSize) {
                results.push([...currentCombo]);
                return;
            }
            if (start >= totalLength) {
                return;
            }

            currentCombo.push(start);
            recurse(currentCombo, start + 1);
            currentCombo.pop();

            recurse(currentCombo, start + 1);
        };
        recurse([], 0);
        return results;
    };

    const allIndexTriplets = generateIndexCombinations(characterArray.length, 3);

    const validTriplets = allIndexTriplets.filter(
        (indices) => {
            const [alpha, beta, gamma] = indices.map(idx => characterArray[idx]);

            const areUnique = alpha !== beta && beta !== gamma && alpha !== gamma;

            const satisfyConditions =
                alpha < (beta + gamma) &&
                beta < (alpha + gamma) &&
                gamma < (alpha + beta);

            return areUnique && satisfyConditions;
        }
    );

    console.log(validTriplets.length);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));