function Main(input) {
    input = input.trim();
    const n = parseInt(input, 10);

    // nからc引いた数の約数の数を調べればいいんじゃね!?

    let count = 0;
    for(let c = 1; c < n; c++) {
       const subNum = n - c;

       count += toDivisor(subNum);
    }

    console.log(count);
}

// 約数の数を求める関数
function toDivisor(num) {
    let count = 0;
    let double = 0;
    for(let i = 1; i**2 <= num; i++) {
        if(num % i != 0) continue;
        if(i**2 === num) double++;
        count++;
    }

    return count * 2 - double;
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));