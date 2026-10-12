
function solve(n, nums) {
    var sum = 0, max = 0;
    nums.forEach(function (n) {
        if (max < n) {
            max = n;
        }
        sum += n;
    });
    if (max < sum - max) {
        return 'Yes';
    }
    return 'No';
}

function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split('\n')
    var n = input[0];
    var nums = input[1].split(' ').map(function(n) { return Number(n)});
    console.log(solve(n, nums));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));