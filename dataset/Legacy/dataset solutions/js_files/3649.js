function Main(input) {
    var A = input.split(' ');
    var cost = 0;

    A = A.map((s) => parseInt(s));
    A = A.sort();  

    for (var i = 0 ; i < A.length - 1 ; ++i) {
        cost += Math.abs(A[i] - A[i+1]);
    }

    console.log(cost);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));