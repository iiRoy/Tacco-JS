const factorization = (n) => {
    let primes= []
    for(let i=2; i*i<=n; i++) {
        let exponent = 0
        while(n%i===0) {
            n /= i
            exponent++
        }
        if(exponent) {
            primes.push({p:i, e:exponent})
        }
    }
    
    if(n!==1) {
        primes.push({p:n, e:1})
    }
    return primes
}

const main = (arg) => {
    const [N,P] = arg.split(" ").map(Number)
    const f = factorization(P)
    
    gcd = 1;
    for(let i=0; i<f.length; i++){
        let tmp = parseInt(f[i].e/N)
        gcd *= f[i].p**tmp
    }
    console.log(gcd)
    
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
