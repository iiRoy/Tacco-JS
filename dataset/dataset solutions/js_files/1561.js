
const SieveOfEratosthenes = (n) => {
    let flg = (new Array(n)).fill(0)/* set flg[i] to true when it is seived */
    let primes = []/* list of prime numbers */
    for(let i=2; i*i<=n; i++) {
        if(!flg[i]) {
            primes.push(i)
            for(let j=i; j*j<=n; j+=i) {
                flg[j] = 1
            }
        }
    }
    return primes
}

const factorizationBySoE = (n, primes) => {
    //const primes = SieveOfEratosthenes(n)
    let factors = {}
    primes.some(p => {
        if(n < p) return true
        while(n%p===0) {
            if(!factors[p])factors[p]=1
            else factors[p]++
            n/=p
        }
    })
    if(n>1)factors[n]=1
    return factors
}


const getGCD = (a,b) => {
    if(b===0)return a
    return getGCD(b, a%b)
}

const main = (arg) => {
    const N = Number(arg.split("\n")[0])
    const a = arg.split("\n")[1].split(" ").map(Number)
    
    //  check if p is in {a} (paircoprime)
    const primes = SieveOfEratosthenes(Math.max(...a))
    const set = [...new Array(N)].fill(0)
    isPairCoprime = true
    for(let i=0; i<N; i++) {
        const factors = Object.keys(factorizationBySoE(a[i], primes))
        for(let j=0; j<factors.length; j++ ) {
            // console.log(`i=${i}, j=${j}, ${factors[j]}`)
            // console.log(factors)
            if(set[factors[j]] === 1) {
                isPairCoprime = false
            }
            set[factors[j]] = 1
        }
    }
    
    if(isPairCoprime) {
        console.log("pairwise coprime")
        return
    }
    
    // setcoprime
    let gcd = getGCD(a[0], a[1])
    for(let i=1; i<a.length-1; i++) {
        gcd = getGCD(gcd, a[i+1])
        // console.log(gcd)
    }
    
    if(gcd===1) {
        console.log("setwise coprime")
        return
    }
    
    console.log("not coprime")
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));