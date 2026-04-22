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
	var result = 
    lines[1].split(" ").map((x, index) => { return {order: Number(x), id: index + 1}})
  	.sort((a, b) => {return a.order - b.order}).map(x => x.id).join(" ");
    
    console.log(result);
    //for(var i =0; i<lines.length; i++){
    //  console.log(lines[i]);
    //}
});