function Main(input) {
    input = input.split("\n");
    var l0 = input[0].split(" ");
    var N = parseInt(l0[0]);
    var K = parseInt(l0[1]);
    var n, n0, n1, n2;
    var susi = [];
    for (n = 1; n <= N; n++) {
        var ln = input[n].split(" ");
        var neta = {};
        neta.t = parseInt(ln[0]);
        neta.d = parseInt(ln[1]);
        susi.push(neta);
    }
//susi.sort(function(a,b) { return b.d - a.d; });
    var max = 0;
    function comb2(n1, n2) {
        var m = new Array(100001);
        var nest = 0;
        var col = 1;
        nest0(nest, col, n1, n2, m);
    }
    function nest0(nest, col, n1, n2, m) {
        var i, k;   
        for (i = nest + 1 ; i <= n2 + col; i++) {
            m[col] = i;
            if (n1 != col) {
                nest0(i, col + 1, n1, n2, m);
            } else {
                var d0 = 0;
                var sum = 0;
                var s = new Set();
                for (k = 1; k <= n1; k++) {
                    var a = m[k];
                    s.add(susi[a - 1].t);
                    sum += susi[a - 1].d;
                }
                var mm = s.size * s.size;
                mm += sum;
                max = Math.max(max, mm);
            }
        }
    }

    comb2(K, N-K);

    console.log(max);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
