const computeNetPrice = (quantityUnits) => {
    console.log(quantityUnits * 800 - ((quantityUnits / 15) | 0) * 200);
};

computeNetPrice(Number(require("fs").readFileSync("/dev/stdin", "utf8")));
