process.stdin.resume();
process.stdin.setEncoding('utf8');


process.stdin.on('data', function (chunk) {
    let n = chunk.toString() // 文字列化する
        .split("\n") // \nで分割
        .filter(x => x !== "");

    for (let i = 0; i < n.length; i++) {
        const money = 1000 - n[i];
        const fivehundred = money / 500;
        const amari = money % 500;
        const hundred = amari / 100;
        const hundredamari = amari % 100;
        const fifty = hundredamari / 50;
        const fiftyamari = hundredamari % 50;
        const ten = fiftyamari / 10;
        const tenamari = fiftyamari % 10;
        const five = tenamari / 5;
        const onecoin = tenamari % 5;
        const a = Math.floor(fivehundred);
        const b = Math.floor(hundred);
        const c = Math.floor(ten);
        const d = Math.floor(five);
        const e = Math.floor(fifty);
        const f = Math.floor(onecoin);
        // console.log(a);
        // console.log(b);
        // console.log(c);
        // console.log(d);
        // console.log(onecoin);
        if (n[i] !== "0") {
            console.log(a + b + c + d + e + f);
        } else {
            false;
        }
    }
});
