function factorization1(n) {
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


function main(arg) {
    let N = Number(arg)
    let MOD = 10**9+7
    
    let factors = {}
    for(let i=1; i<=N; i++) {
        let tmpFactors = factorization1(i)
        tmpFactors.forEach(f=>{
            if(factors[f.p]) {
                factors[f.p] += f.e
            } else {
                factors[f.p] = f.e
            }
        })
    }
    let ans = 1
    Object.keys(factors).forEach(f=>{
        ans*=(factors[f]+1)
        ans%=MOD
    })
    console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));