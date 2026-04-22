const MOD = 10**9+7
const N = 10**5+1000

let fac = [...new Array(N)].fill(0)
let ifac = [...new Array(N)].fill(0)

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


const mpow = (x, n) => {
    ans = BigInt(1);
    let _x = BigInt(x)
    while(n != 0){
        if(n & 1) ans = ans*_x % BigInt(MOD);
        _x = _x*_x % BigInt(MOD);
        n = n >> 1;
    }
    return Number(ans);
}

const comb = (n, r) => {
    if(n == 0 && r == 0) return 1;
    if(n < r || n < 0) return 1;
    // const tmp = ifac[n-r] % MOD * ifac[r] % MOD;
    const tmp = (BigInt(ifac[n-r]) * BigInt(ifac[r])) % BigInt(MOD);
    return Number((tmp * BigInt(fac[n])) % BigInt(MOD))
}

const init = () => {
    fac[0] = 1;
    ifac[0] = 1;
    for(let i=0; i<N; i++){
        fac[i+1] = fac[i]*(i+1) % MOD; // n!(mod M)
        // ifac[i+1] = ifac[i]*mpow(i+1, MOD-2) % MOD; // k!^{M-2} (mod M) ←累乗にmpowを採用
        ifac[i+1] = mpow(fac[i+1], MOD - 2) % MOD
    }
}

const main = (arg) => {
    let [n, m] = arg.split(" ").map(Number)
    let factors = factorization(m)
    let ans = 1
    init()

    Object.keys(factors).forEach(f=>{
        let a = factors[f].e+n-1
        let b = factors[f].e
        if(a < 2*b)b=a-b
        ans *= comb(a, b)
        ans %= MOD
    })
    console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));