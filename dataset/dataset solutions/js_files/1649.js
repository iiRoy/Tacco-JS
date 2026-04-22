function main(arg) {
    let [n,k] = arg.split("\n")[0].split(" ").map(Number)
    let a = arg.split("\n")[1].split(" ").map(Number)
    
    let sum=1
    let mod = 10**9+7
    // initialize
    for(let i=0; i<k; i++) {
        sum = sum * a[i] % mod
        sum %= mod
    }
    //console.log(sum)

    let nextSum
    for(let i=1; i<n-k+1; i++) {
        //console.log(`sum=${sum}, a[i-1]=${a[i-1]}`)
        
        nextSum = sum * a[i+k-1] / a[i-1] 
        //console.log(nextSum)
        if(nextSum > sum)console.log("Yes")
        else console.log("No")
        nextSum %= mod
        sum = nextSum
        //sum %= (10**9+7)
        //console.log(sum)
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));