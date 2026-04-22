const yakusuu = (N) => {
    let count = 0
    for(let i = 0; i <= N; i++) {
        if(N % i === 0) {
            count++;
        }
    }
    return count
}

const Main = (input) => {
    const N = Number(input)
    let count = 0;
    for(let i = 0; i <= N; i++) {
        if(i % 2 === 0) {
            continue;
        }
        if(yakusuu(i) === 8) {
            count++;
        }
    }
    console.log(count)
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));