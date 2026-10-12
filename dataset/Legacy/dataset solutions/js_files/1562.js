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
    else if(a===0)return b
    return getGCD(b, a%b)
}

const main = (arg) => {
    const N = Number(arg.split("\n")[0])
    const a = arg.split("\n")[1].split(" ").map(Number)
    
    const MAX_A = 10**6+1
    
    //  check if p is in {a} (paircoprime)
    const primes = SieveOfEratosthenes(MAX_A)
//    return
    let set = [...new Array(MAX_A)].fill(0)
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
/*
    for(let i=0; i<N; i++) {
        set[a[i]]++
    }
//  return
    for(let i=2; i<MAX_A; i++) {
         let cnt=0
         for(let j=i; j<MAX_A; j+=i) {
             cnt+=set[j]
         }
        if(cnt>1) {
             isPairCoprime = false
         }
     }
 */
    if(isPairCoprime) {
        console.log("pairwise coprime")
        return
    }
     // return
    // setcoprime
    // let gcd = getGCD(a[0], a[1])
    let gcd = 0
    for(let i=0; i<a.length; i++) {
        gcd = getGCD(gcd, a[i])
        // console.log(gcd)
    }
    
    if(gcd===1) {
        console.log("setwise coprime")
        return
    }
    
    console.log("not coprime")
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
