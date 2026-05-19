const processData = (sourceString) => {
    const [itemCountText, thresholdAmountText] = sourceString.split(' ');

    const quantityValue = Number(itemCountText);
    const totalCost = 500 * quantityValue;
    const comparisonValue = Number(thresholdAmountText);
    
    console.log(totalCost >= comparisonValue ? 'yes' : 'no');
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
