//http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0565

//http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=ITP1_9_A&lang=ja

process.stdin.resume();
process.stdin.setEncoding('utf8');


process.stdin.on('data', function (chunk) {
    let n = chunk.toString() // 文字列化する
        .split("\n") // \nで分割
        .map(x => Number(x))
        .filter(x => x !== 0);
    const a = n.slice(0, 3);
    const b = n.slice(3, 5);
    const data1 = Math.min.apply(null, a);  // → 9
    const data2 = Math.min.apply(null, b);  // → 1

    const ans = data1 + data2 - 50
    console.log(ans);

});
