const input = require("fs").readFileSync("/dev/stdin", "utf8")
const lines = input.split('\n')
let [N, M] = lines[0].split(' ').map(Number)

const map = []
for(let i = 1; i <= M; i++) {
    const [A, B] = lines[i].split(' ').map(Number)
    let findA = null
    let findB = null
    for (let i = 0; i < map.length; i++) {
        if (map[i][A]) {
            findA = i
            if (!map[i][B]) {
                map[i].count++
                map[i][B] = true
            }
        } else if (map[i][B]) {
            findB = i
            if (!map[i[A]]) {
                map[i].count++
                map[i][A] = true
            }
        }
    }
    if (findA === null && findB === null) {
        const area = {count: 2}
        area[A] = true
        area[B] = true
        map.push(area)
    } else if (findA !== findB) {
        const merge = {
            ...map[findA],
            ...map[findB],
            count: map[findA].count + map[findB].count - 2
        }
        map.splice(findA, 1, merge)
        map.splice(findB)
    }
}

let c = 0
for (let i = 0; i < map.length; i++) {
    c += map[i].count
}

console.log(map.length + N - c - 1)
