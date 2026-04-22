const checkLoop = (tmp, n, mod) => {
    for(let i=0; i<n; i++) {
        if(tmp[i]===mod) {
            return i
        }
    }
    return n
}

const main = (arg) => {
    const [N,X,M] = arg.split(" ").map(Number)
    
    let tmp = [...new Array(M)].fill(0)
    let mods = [...new Array(M)].fill(0)
    tmp[0] = X
    mods[0] = X
    // console.log(tmp)
    let i=1, loopStart=0
    for(; i<M; i++) {
        tmp[i] = tmp[i-1]**2 % M
        // console.log(`tmp[i]=${tmp[i]}`)
        if(mods[tmp[i]]!==0) {
            // loop detected
            // console.log(i)
            loopStart = mods[tmp[i]]
            break
        } else {
            mods[tmp[i]] = i
        }
        // loopStart = checkLoop(tmp, i, tmp[i])
        // if(loopStart!==i) {
        //     break
        // }
    }
    // console.log(tmp)
    const loopEnd = i
    const loopCount = Math.floor(N/(i-loopStart))

    let ans = 0
    let sumOfLoop = 0
    for(i=loopStart; i<loopEnd; i++) {
        sumOfLoop += tmp[i]
    }
    ans += sumOfLoop*loopCount

    // add first something before loop starts
    for(i=0; i<loopStart; i++) {
        ans += tmp[i]
    }

    // add last something after loop ends
    const rest = N-loopStart-(loopEnd-loopStart)*loopCount
    // console.log(`rest=${rest}`)
    for(i=loopStart; i<loopStart+rest; i++) {
        ans += tmp[i]
    }
    console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));