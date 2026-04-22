function Main(input) {

    var H = Number(input);

    if (H === 1) return console.log(1);

    var counter = 1;
    while (true) {
        H = Math.floor(H / 2);
        counter++;
        if (H === 1) break;
    }

    const answer = Math.pow(2, counter) - 1;

    //出力
    console.log(answer);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));