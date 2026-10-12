// inputに入力データ全体が入る
function Main(input) {
    var t;
    var input = input.split("\n");
    t = input[0];
    var min_try_count = -1;



    for (var i = "a".charCodeAt(0); i < "z".charCodeAt(0) + 1; i++) {
        //t_primeが単一の文字のみになっていればbreak
        if (/^([a-z])\1*$/.test(t)) {
            min_try_count = 0;
            break;
        }

        var tmp = t;
        var t_prime = "";
        var c = String.fromCharCode(i);
        var try_count = 0;

        while (true) {

            //文字数-1回分ループをまわす。
            //t'のi文字目について、tのi文字目またはi+1文字目を見る。
            //cと一致する文字があれば、その文字をt'のi文字目とする。
            //一致しなければ、tのi文字目をt'のi文字目とする。
            /*for (var j = tmp.length - 1; j >= 0; j--) {
                if (tmp.charAt(j) != c) {
                    tmp = rep(tmp, j, "");
                    break;
                }
            }*/
            for (var j = 0; j < tmp.length-1; j++) {
                if (c === tmp.charAt(j)) {
                    t_prime += c;
                }
                else if (c === tmp.charAt(j + 1)) {
                    t_prime += c;
                }
                else {
                    t_prime += tmp.charAt(j);
                }
            }

            try_count++;

            console.log(t_prime);
            //t_primeが単一の文字のみになっていればbreak
            if (/^([a-z])\1*$/.test(t_prime)) {
                break;
            }
            tmp = t_prime;
            t_prime = "";

        }

        if (min_try_count == -1 || min_try_count > try_count) {
            min_try_count = try_count;
        }

    }
    console.log(min_try_count);

}

var conert = function(t, c) {
    
}

var rep = function(text, n, value) {　　
    return text.substr(0, n) + value + text.substr(n + 1);
};
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
