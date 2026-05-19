function Main(input) {
    let input = input.split(" ");
    let a = Number.parseInt(input[0], 10), b = Number.parseInt(input[1], 10),
        c = Number.parseInt(input[2], 10), x = Number.parseInt(input[3], 10),
        y = Number.parseInt(input[4], 10);
    let min = Math.min(x, y), max = Math.max(x, y);
    let priceList = [];
    let singlePrice = min * a + min * b;
    priceList.push(singlePrice);
    setPrice1 = min * c * 2 + (x - min) * a + (y - min) * b;
    priceList.push(setPrice1);
    setPrice2 = max * c * 2;
    priceList.push(setPrice2);
    let bestPrice = Math.min.apply(null, priceList);
    console.log(bestPrice);
}
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));
Main("1500 2000 1600 3 2");
Main("1500 2000 1900 3 2");
Main("1500 2000 500 90000 100000");