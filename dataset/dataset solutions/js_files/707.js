const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim()
const lines = input.trim().split("\n")
while (lines.length > 1) {
    const [c1, c2] = lines.shift().trim().split(" ").map(Number)
    const d1 = [], d2 = []
    while (d1.length < c1) {
        d1.push(parseInt(lines.shift().trim()))
    }
    while (d2.length < c2) {
        d2.push(parseInt(lines.shift().trim()))
    }

    const sD1 = d1.reduce((s, v) => s + v, 0)
    const sD2 = d2.reduce((s, v) => s + v, 0)
    if(sD1 === sD2) {
        d1.sort((a,b) =>  a - b)
        let rs = -1, i = 0
        while (rs === -1 && i < c1) {
            if(d2.includes(d1[i])) {
                rs = d1[i]
            }
            i++
        }
        if(rs === -1) {
            console.log(-1)
        } else {
            console.log(rs + ' ' + rs)
        }
    } else if((sD1 + sD2)%2){
        console.log(-1)
    } else {
        const sD = (sD1 + sD2) / 2
        let m1, m2, sum = 201
        for (let i = 0; i < c1; i++) {
            const t1 = d1[i], t2 = sD - sD1 + t1
            if(d2.includes(t2) && sum > t1 + t2) {
                sum = t1 + t2
                m1 = t1
                m2 = t2
            }
        }
        if(sum < 201) {
            console.log(m1 + ' ' + m2)
        } else {
            console.log(-1)
        }
    }
}
