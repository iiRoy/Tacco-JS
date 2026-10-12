function Main(input) {
    const N = parseInt(input[0].split(/\s/)[0]);
    const X = parseInt(input.shift().split(/\s/)[1]);
    const BLU = [];
    input.forEach(element => {
        var sp = element.split(/\s/);
        var value = {
            B: parseInt(sp[0]),
            L: parseInt(sp[1]),
            U: parseInt(sp[2]),
        };
        value.MIN_POINT = value.B * value.L; // 最小優先度にした時の獲得ポイント
        value.MAX_DIV = (X - value.B) * value.U; // X時間勉強したら埋められる差
        BLU.push(value);
    });
    BLU.sort((a, b) => b.MAX_DIV - a.MAX_DIV); // 降順

    var enemySum = 0; // 全部最小優先度にした時の相手のポイント
    BLU.forEach(element => {
        enemySum += element.MIN_POINT;
    });

    // console.log(BLU);
    

    var difference = enemySum;
    var learnTime = 0;
    var lastIndex = 0;
    for (var i = 0; i < N; i++) {
        var element = BLU[i];
        difference -= element.MAX_DIV + element.MIN_POINT;
        if (difference <= 0) {
            difference += element.MAX_DIV + element.MIN_POINT;
            // 超えたら元に戻してブレイク
            lastIndex = i;
            break;
        } else {
            learnTime += X;
        }
    }

    // 最後の調整
    var minLearnTime = Number.MAX_SAFE_INTEGER;
    for (var i = lastIndex; i < N; i++) {
        var element = BLU[i];
        minLearnTime = Math.min(minLearnTime, Math.ceil((difference - element.MIN_POINT) / element.U) + element.B);
        // console.log(minLearnTime);
    }
    learnTime += minLearnTime

    console.log(learnTime);
}

// 1行入力の場合
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// 改行で分割
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));

// 改行・空白で分割
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));