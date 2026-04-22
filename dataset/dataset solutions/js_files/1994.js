(v=>{
    const n = ~~(v.split(' ')[0])
    const k = ~~(v.split(' ')[1])
    const gcd = (x,y) =>{
        const f = (a,b) => b ? f(b, a % b): a 
        return f(x,y)
    }
    // 前計算
    const pre = []
    for(let i=0;i<k; ++i){
        const preadd = {}
        for(let j=0;j<k; ++j){
            const g = gcd(i+1, j+1)
            if(preadd[g] === undefined)preadd[g] =0
            preadd[g] += 1
        }
        const preadd2 = []
        Object.keys(preadd).forEach(key=>{
            preadd2.push([+key,preadd[key]])
        },preadd)
        pre.push(preadd2) 
    }
    
    const dp = [new Array(k+1).fill(1)]

    for(let i=1; i< n; ++i){
        dp.push(new Array(k+1).fill(0))
        for(let j=0; j<k; ++j){
            for(let preelm of pre[j]){
                dp[i][preelm[0]-1] +=  dp[i-1][j] * preelm[1]
                dp[i][preelm[0]-1] %= 1e+9+7
            }
        }
    }

    const last_dp = dp.pop()
    let res = 0
    for(let i=0; i<last_dp.length; ++i){
        res += (i+1) * last_dp[i]
        res %= 1e+9+7
    }
    console.log(res)

})(require("fs").readFileSync("/dev/stdin", "utf8"))