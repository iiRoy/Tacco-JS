process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var lines = [];
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
reader.on('line', (line) => {
    // ここで入力を処理する
    lines.push(line);
});
reader.on('close', () => {
    // ここで出力する
    var n = Number(lines[0]);
    console.log((n + (n % 2)) / (2 * n));
    //for(var i =0; i<lines.length; i++){
    //  console.log(lines[i]);
    //}
});