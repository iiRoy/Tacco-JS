function Main(input) {

	input = input.split("\n");
    
    N = Number(input[0]);
    let An = input[1].split(" ").map(Number);
    
    if (gcd(...An) !== 1) {
        console.log("not coprime");
        return;
    }
        
    let freq = Array(1000001).fill(0);
    for(let A of An) {
        if (A === 1) continue;
        freq[A]++;
        if (freq[A] > 1) {
            console.log("setwise coprime");
            return;
        }
    }
    
    for (let i = 2; i <= 1000001; i++) {
        let tmp = 0;
        for (let j = i; j <= 1000001; j += i) {
            tmp += freq[j];
            if (tmp >= 2) {
                console.log("setwise coprime");
                return;
            }
        }
    }
    
    console.log("pairwise coprime");
    
}

function gcd(...arg) {
    
    var f = (a, b) => b ? f(b, a % b) : a
    var ans = arg[0]
    for (var i = 1; i < arg.length; i++) {
        ans = f(ans, arg[i]); 
    }
    return ans;
    
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));