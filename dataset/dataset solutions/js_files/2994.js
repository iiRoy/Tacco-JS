function Main(input) {
    const H = parseInt(input.shift());
    const W = parseInt(input.shift());
    const N = parseInt(input.shift());
    const sr = parseInt(input.shift());
    const sc = parseInt(input.shift());
    const S = input.shift();
    const T = input.shift();

    var left = sc, right = sc, top = sr, bottom = sr;

    for (var i = 0; i < N; i++) {
        var s = S.charAt(i);
        var t = T.charAt(i);
        if (s == "L") {
            left--;
        } else if (s == "R") {
            right++;
        } else if (s == "U") {
            top--;
        } else {
            bottom++;
        }
        if(left <= 0 || right > W || top <= 0 || bottom > H) {
            console.log("NO");
            return;
        } 

        if (t == "L") {
            right = Math.max(1, right-1);
        } else if (t == "R") {
            left = Math.min(W, left+1);
        } else if (t == "U") {
            bottom = Math.max(1, bottom-1);
        } else {
            top = Math.min(H, top+1);
        }
    }
    console.log("YES");
}

// 改行・空白で分割
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
