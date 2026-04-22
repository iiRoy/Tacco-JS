// inputに入力データ全体が入る
function Main(input) {

    input = input.split("\n");
  
    line1 = input[0].split(" ");
    let N = parseInt(line1[0], 10);
    let K = parseInt(line1[1], 10);

    line2 = input[1].split(" ");


    let aryHyoten = [];
    let hyoten = 0;

    for (let i = 0; i <= N; i++) {

        if (i >= K) {
            for (let j = i - K; j < i; j++) {
                let score = parseInt(line2[j], 10);
                if (hyoten === 0) {
                    hyoten = score;
                } else {
                    hyoten = hyoten * score;
                }
            }
            aryHyoten.push(hyoten);
            hyoten = 0;
        }

    }

    let aryRslt = [];
    let cur = 0;
    let pre = 0;

    for (let i = 0; i < aryHyoten.length; i++) {
        cur = aryHyoten[i];
        if (i > 0) {
            if (pre < cur ) {
                aryRslt.push('Yes');
            } else {
                aryRslt.push('No');
            }
        }
        pre = aryHyoten[i];
    }

    for (let i = 0; i < aryRslt.length; i++) {
        //出力
        console.log(aryRslt[i]);
    }
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));