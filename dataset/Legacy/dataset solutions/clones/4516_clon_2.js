// sourceに入力データ全体が入る
function Solve(source) {
    var dogs, monkeys;
    source = source.split("\n");
    source = source[0].split(" ");
    dogs = source[0];
    monkeys = source[1];
    
    if(Math.abs(dogs - monkeys) >= 2) {
        console.log(0);
    } else if(Math.abs(dogs - monkeys) == 1) {
        console.log((calcFactorial(dogs) % 1000000007) * (calcFactorial(monkeys) % 1000000007)% 1000000007);
    } else if(Math.abs(dogs - monkeys) == 0) {
        console.log(((calcFactorial(dogs) % 1000000007) * (calcFactorial(monkeys) % 1000000007) * 2)% 1000000007);
    }

}

var calcFactorial = function(value) {
    return (value <= 0) ? 1 : ((value % 1000000007) * (calcFactorial(value-1) % 1000000007));
};

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Solveを呼び出します）
Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
