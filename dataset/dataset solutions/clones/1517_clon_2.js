const findCycle = (arr, size, value) => {
    for(let idx=0; idx<size; idx++) {
        if(arr[idx]===value) {
            return idx
        }
    }
    return size
}

const solve = (data) => {
    const [cnt,first,modulo] = data.split(" ").map(Number)
    
    let seq = [...new Array(modulo)].fill(0)
    let used = [...new Array(modulo)].fill(0)
    seq[0] = first
    used[0] = first
    // console.log(seq)
    let idx=1, cycleStart=0
    for(; idx<modulo; idx++) {
        seq[idx] = seq[idx-1]**2 % modulo
        // console.log(`tmp[i]=${tmp[i]}`)
        if(used[seq[idx]]!==0) {
            // loop detected
            // console.log(i)
            cycleStart = used[seq[idx]]
            break
        } else {
            used[seq[idx]] = idx
        }
        // loopStart = checkLoop(tmp, i, tmp[i])
        // if(loopStart!==i) {
        //     break
        // }
    }
    // console.log(seq)
    const cycleEnd = idx
    const cycleTimes = Math.floor(cnt/(idx-cycleStart))

    let result = 0
    let loopSum = 0
    for(idx=cycleStart; idx<cycleEnd; idx++) {
        loopSum += seq[idx]
    }
    result += loopSum*cycleTimes

    // add first something before loop starts
    for(idx=0; idx<cycleStart; idx++) {
        result += seq[idx]
    }

    // add last something after loop ends
    const remain = cnt-cycleStart-(cycleEnd-cycleStart)*cycleTimes
    // console.log(`rest=${rest}`)
    for(idx=cycleStart; idx<cycleStart+remain; idx++) {
        result += seq[idx]
    }
    console.log(result)
}
solve(require("fs").readFileSync("/dev/stdin", "utf8"));
