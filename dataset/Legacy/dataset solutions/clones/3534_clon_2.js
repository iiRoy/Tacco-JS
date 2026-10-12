const MODULO = 10**9+7
// divisors[d].e+n-1、において max(n)=10**5, max(divisors[d].e)=log(M)=log(10**9)=29.89..=30
const LIMIT = 10**5+30

let fact = [...new Array(LIMIT)].fill(0)
let invFact = [...new Array(LIMIT)].fill(0)
const multiply = (x,y) => ((x>>16)*y%MODULO*65536+(x&65535)*y)%MODULO;

const factorize = (value) => {
    let divisors= []
    for(let idx=2; idx*idx<=value; idx++) {
        let count = 0
        while(value%idx===0) {
            value /= idx
            count++
        }
        if(count) {
            divisors.push({p:idx, e:count})
        }
    }
    
    if(value!==1) {
        divisors.push({p:value, e:1})
    }
    return divisors
}

const powerMod = (base, exp) => {
    result = 1;
    let current = base
    while(exp != 0){
        if(exp & 1) result = multiply(result,current);
        current = multiply(current,current);
        exp = exp >> 1;
    }
    return result;
}

const choose = (top, bottom) => {
    if(top == 0 && bottom == 0) return 1;
    if(top < bottom || top < 0) return 0;
    return multiply(invFact[top], multiply(fact[bottom], invFact[top-bottom]))
}

const prepare = () => {
    fact[0] = 1;
    invFact[0] = 1;
    for(let idx=0; idx<LIMIT; idx++){
        fact[idx+1] = multiply(fact[idx],(idx+1));
        invFact[idx+1] = powerMod(fact[idx+1], MODULO - 2)
    }
}

const solve = (src) => {
    let [n, m] = src.split(" ").map(Number)
    let divisors = factorize(m)
    let answer = 1
    prepare()
    Object.keys(divisors).forEach(d=>{
        let upper = divisors[d].e+n-1
        let lower = divisors[d].e
        answer = multiply(answer,choose(upper, lower))
    })
    console.log(answer)
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"));
