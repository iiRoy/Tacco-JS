// inputに入力データ全体が入る
function Main(input) {
    var a = input[0].split(" ")[0]-0;
    var b = input[0].split(" ")[1]-0;
    var ans = 0;
    for(var i=a;i<=b;i++){
        var tmp = i.toString().split("");
        if(tmp.join("") == tmp.reverse().join("")) ans ++;
    }
    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));