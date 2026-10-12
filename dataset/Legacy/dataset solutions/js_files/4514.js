// inputに入力データ全体が入る
function Main(input) {
    var n_dog, n_monkey;
    input = input.split("\n");
    input = input[0].split(" ");
    n_dog = input[0];
    n_monkey = input[1];
    
    if(Math.abs(n_dog - n_monkey) >= 2) {
        console.log(0);
    } else if(Math.abs(n_dog - n_monkey) == 1) {
        console.log((factorial(n_dog) % 1000000007) * (factorial(n_monkey) % 1000000007)% 1000000007);
    } else if(Math.abs(n_dog - n_monkey) == 0) {
        console.log(((factorial(n_dog) % 1000000007) * (factorial(n_monkey) % 1000000007) * 2)% 1000000007);
    }

}


function factorial(n) {
    var result = 1;
    for (var i = 1; i <= n; i++) {
        result = (result % 1000000007) * (i % 1000000007);
    }
    return result;
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
