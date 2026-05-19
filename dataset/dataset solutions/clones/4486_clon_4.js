const processInput = (rawContent) => {
    const [firstLine, secondLine] = rawContent.trim().split("\n");

    const [countLimit, remainderType] = firstLine.split(" ").map(Number);
    const valueList = secondLine.split(" ").map(Number);

    const { evenQuantity, oddQuantity } = valueList.reduce(
        (acc, currentVal) => {
            currentVal % 2 === 0 ? acc.evenQuantity++ : acc.oddQuantity++;
            return acc;
        },
        { evenQuantity: 0, oddQuantity: 0 }
    );

    const evenSubsets = Math.pow(2, evenQuantity);

    let oddSubsets = 0;

    const combinations = (n, k) => {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;

        let result = 1;
        for (let i = 1; i <= k; i++) {
            result = result * (n - i + 1) / i;
        }
        return result;
    };

    if (remainderType === 0) {
        oddSubsets = Array.from({ length: oddQuantity + 1 }, (_, idx) => idx)
                      .filter(idx => idx % 2 === 0)
                      .reduce((sum, idx) => sum + combinations(oddQuantity, idx), 0);
    } else {
        oddSubsets = Array.from({ length: oddQuantity + 1 }, (_, idx) => idx)
                      .filter(idx => idx % 2 !== 0)
                      .reduce((sum, idx) => {
                          const currentCombi = combinations(oddQuantity, idx);
                          console.log(currentCombi);
                          return sum + currentCombi;
                      }, 0);
    }

    console.log(evenSubsets * oddSubsets);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
