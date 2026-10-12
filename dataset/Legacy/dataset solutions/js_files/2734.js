function Main(input) {
    var inp = input.split("\n");
    var N = inp[0];
    inp.shift()
    var A = inp;
    
    for(var i=0;i<N;i++){
        var arr = A.slice(0, A.length);
        arr.splice(i,1);
        console.log(arr.reduce((a,b)=>a>b?a:b));
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));