process.stdin.resume();
process.stdin.setEncoding("utf8");
// 自分の得意な言語で
// Let's チャレンジ！！
    var lines = [];
    var reader = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
reader.on("line", (line) => {
    lines.push(line);
});
reader.on("close", () => {
//入力をスペース区切りで配列に変換
    var e = lines[0].split(" "), h = Number(e[0]), a = (Number(e[1]));
    if(h % a === 0){
        console.log(h);
    }else if(h % a !== 0){
        a = a -1;
        console.log(a);
    }
    
});