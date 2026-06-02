function Solve(src) {
    var parsedValue = parseInt(src); //46979
    var S = parsedValue;

    var hourBase = 3600;
    var h = Math.floor(S / hourBase); //13

    var restAfterHours = S % hourBase;
    var x = restAfterHours ; //179

    var minuteBase = 60;
    var m = Math.floor(x / minuteBase); //2

    var restAfterMinutes = x % minuteBase;
    var z = restAfterMinutes; //59

    var s = z; //59
    var resultText = h + ":" + m;
    resultText = resultText + ":" + s;
    console.log(resultText);
}
// デバッグ用
function debug() {
    var elem = document.getElementById("input");
    var input = elem.value;
    Solve(input);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
var stdinText = require("fs").readFileSync("/dev/stdin", "utf8");
Solve(stdinText);
