function Main(input) {
    const lines = input.split('\n');
    const abc = lines[0].split(' ');

    const a = abc[0];
    const b = abc[1];
    const c = abc[2];
    const k = lines[1];

    let largest;
    let sumOthers;
    if(a >= b && a >= c){
        largest = a;
        sumOthers = b + c;
    } else if(b >= c){
        largest = b;
        sumOthers = a + c;
    } else {
        largest = c;
        sumOthers = a + b;
    }

    const answer = largest * Math.pow(2, k) + sumOthers;
    console.log(answer);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));