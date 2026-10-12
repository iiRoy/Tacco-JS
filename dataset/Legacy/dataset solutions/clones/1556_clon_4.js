function processInput(data) {
    const lines = data.split("\n");
    const numArr = lines[1].split(" ").map(val => BigInt(val));

    const totalSum = numArr.reduce((accumulator, currentVal) => accumulator + currentVal, BigInt(0));
    const sumSquares = numArr.reduce((accumulator, currentVal) => accumulator + (currentVal * currentVal), BigInt(0));

    const finalResult = ((totalSum * totalSum) - sumSquares) / BigInt(2);

    console.log(Number(finalResult % BigInt(1000000007)));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
