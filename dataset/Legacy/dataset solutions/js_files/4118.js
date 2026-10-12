// inputに入力データ全体が入る
function Main(input) {
    var a = input[0].split(" ")[0]-0;
    var b = input[0].split(" ")[1]-0;
    var s = input[1];
    var rx = new RegExp("^\\d{" + a + "}-\\d{" + b + "}$");
    
    console.log(rx.test(s)?"Yes":"No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));