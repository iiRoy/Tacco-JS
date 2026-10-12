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
        // if(tmp[i]===0) {
        //     // loopS
        //     break
        // }
        // console.log(`tmp[i]=${tmp[i]}`)
        if(mods[tmp[i]]!==0) {
            // loop detected
            // console.log(i)
            loopStart = mods[tmp[i]]
            break
        } else {
            mods[tmp[i]] = i
        }
    }
    const loopEnd = i
    const loopNum = loopEnd-loopStart
    const loopCount = loopNum===0 ? 0 : Math.floor(N/(loopNum))
//    console.log(`i=${i}, loopStart=${loopStart}, loopEnd=${loopEnd}, loopCount=${loopCount}`)

    let ans = 0
    let sumOfLoop = 0
    for(i=loopStart; i<loopEnd; i++) {
        sumOfLoop += tmp[i]
    }
    ans += sumOfLoop*loopCount
    
//    console.log(`sumOfLoop=${sumOfLoop}`)

    // add first something before loop starts
    for(i=0; i<loopStart; i++) {
        ans += tmp[i]
    }

    // add last something after loop ends
    const rest = loopNum===0 ? 0 : N-loopStart-(loopNum)*loopCount
//    console.log(`rest=${rest}`)
    for(i=loopStart; i<loopStart+rest; i++) {
        ans += tmp[i]
    }
    console.log(ans)
}

// main("6 2 1001")
// main("100 2 1002")
main("1000 2 16")
// main("19 3 4")
// main("10000000000 10 99959")
// main("10000000000 1889 99959")
// main(require("fs").readFileSync("/dev/stdin", "utf8"));