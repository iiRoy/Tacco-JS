function Main (input) {
    var arr = input.trim().split(/\s|\n/);
    var ts = 0; var hs = 0;
    n = parseInt(arr.shift());
    for(var i = 0; i < n; i++) {
       t = arr.shift();
       h = arr.shift();
       if(t == h) { ts++; hs++; }
       else {t < h ? hs += 3 : ts += 3}
    }
    console.log(ts + " "  + hs);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));