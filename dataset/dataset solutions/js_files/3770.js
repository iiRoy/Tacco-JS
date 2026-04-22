// inputに入力データ全体が入る
function Main(input) {
//    input = input.split(' ');
    //文字列から10進数に変換するときはparseIntを使います
    var n = parseInt(input, 10);
    var ans = 0;
    while ( true ) {
        for (var nine_count = 9; ; nine_count *= 9) {
            if (n - nine_count < 0) {
                if (nine_count != 9) {
                    nine_count /= 9;
                    n -= nine_count;
                    ans++;
                } else {
                    break;
                }
            }
        }
        for (var six_count = 6; ; six_count *= 6) {
            if (n - six_count < 0) {
                if (six_count != 6) {
                    six_count /= 6;
                    n -= six_count;
                    ans++;
                } else {
                    break;
                }
            }
        }
        ans += n;
        break;
    }
    console.log(ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
