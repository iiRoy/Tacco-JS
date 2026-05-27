const processInputData = (sourceContent) => {
    const [initialLine] = sourceContent.split('\n');
    const [itemCount, pricePerUnit, minimumCharge] = initialLine.split(' ').map(Number);

    const totalCalculatedCost = itemCount * pricePerUnit;

    const finalCharge = Math.max(totalCalculatedCost, minimumCharge);

    console.log(String(finalCharge));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
