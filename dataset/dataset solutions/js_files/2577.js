// inputに入力データ全体が入る
function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    // 数値の配列を作る
    const numList0 = input[0].split(' ').map(x => parseInt(x, 10));
    const N = numList0[0];
    const bList = input[1].split(' ').map(x => parseInt(x, 10));

    var total = bList[0];
    for (var i = 0; i < N - 2; i++) {
        total += Math.min(bList[i], bList[i + 1])
    }

    total += bList[N - 2];
    console.log(total);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));