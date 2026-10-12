function Main(input) {

	input = input.split("\n");
    
    let An = input[1].split(" ").map(BigInt);
    
    let A_Sum = BigInt(0);
    An.forEach(value => A_Sum += value);
    
    let tmp = BigInt(0);
    
    for (const A of An) {
        
        A_Sum -= A;
        tmp += A * A_Sum;
        
    }
    
    console.log(Number(tmp % BigInt(1000000007)));
    
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));