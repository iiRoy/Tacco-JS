// inputに入力データ全体が入る
function Main(lines) {
    var header = lines[0];
    var data = header.split(" ");
    var a = data[0]-0;
    var b = data[1]-0;
    var s = lines[1];

    var start = "^\\d{" + a + "}";
    var center = "-";
    var end = "\\d{" + b + "}$";
    var rx = new RegExp(start + center + end);
    var result = rx.test(s);

    if (result) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

var fs = require("fs");
var rawInput = fs.readFileSync("/dev/stdin", "utf8");
var input = rawInput.trim().split("\n");
Main(input);
