const processData = (sourceString) => {
    const numericalStrings = sourceString.split('\n')[0].match(/\d+/g);
    const primaryNumber = +numericalStrings[0];
    const secondaryNumber = +numericalStrings[1];

    const groupIdentifier = new Map([
        [1, 31], [3, 31], [5, 31], [7, 31], [8, 31], [10, 31], [12, 31],
        [4, 30], [6, 30], [9, 30], [11, 30],
        [2, 28]
    ]);

    const primaryTypeClassification = groupIdentifier.get(primaryNumber);

    let finalVerdict = false;

    const isPrimaryInCategoryA = (primaryTypeClassification === 31);
    const isPrimaryInCategoryB = (primaryTypeClassification === 30);

    const secondaryNotOne = (secondaryNumber !== 1);
    const secondaryNotFour = (secondaryNumber !== 4);

    if ((primaryNumber === 2 && secondaryNumber === 2) ||
        (isPrimaryInCategoryA && secondaryNotOne) ||
        (isPrimaryInCategoryB && secondaryNotFour)) {
        finalVerdict = true;
    }

    process.stdout.write(finalVerdict ? "Yes\n" : "No\n");
};

(() => {
    const sourceContent = globalThis.require("node:fs").readFileSync("/dev/stdin", "utf8");
    processData(sourceContent);
})();