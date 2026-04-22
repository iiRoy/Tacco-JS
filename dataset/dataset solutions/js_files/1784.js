function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};

(() => {
    const [ h, w, k ] = readMany(3).map(it => parseInt(it))
    const [ x1, y1, x2, y2 ] = readMany(4).map(it => parseInt(it) - 1)

    const map = []
    for (let i = 0; i < h; i += 1) {
        const line = readMany(1)[0].split('')
        map.push([ ...line ])
    }

    const bfsMap = []
    for (let i = 0; i < h; i += 1) {
        bfsMap.push([])
        for (let j = 0; j < w; j += 1) {
            if (map[i][j] == '@') {
                bfsMap[i].push(-1)
            } else {
                bfsMap[i].push(null)
            }
        }
    }

    bfsMap[x1][y1] = 0
    let bfsQueue = [[ x1, y1 ]]

    const safeSet = (x, y, value) => {
        if (x >= 0 && y >= 0 && x < h && y < w) bfsMap[x][y] = value
    }
    const safeGet = (x, y) => {
        const tmp = bfsMap[x]
        if (tmp) return tmp[y]
    }

    const logMap = () => {
        console.log()
        for (const m of bfsMap) console.log(m)
    }

    while (true) {
        const currentGrid = bfsQueue.shift()
        if (!currentGrid) break

        const [ x, y ] = currentGrid
        const nextStep = safeGet(x, y) + 1

        if (x == x2 && y == y2) break

        for (let i = 1; i <= k; i += 1) {
            const nX = x + i
            const nY = y
            if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
            if (safeGet(nX, nY) === null) {
                safeSet(nX, nY, nextStep)
                bfsQueue.push([ nX, nY ])
            }
        }
        for (let i = 1; i <= k; i += 1) {
            const nX = x - i
            const nY = y
            if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
            if (safeGet(nX, nY) === null) {
                safeSet(nX, nY, nextStep)
                bfsQueue.push([ nX, nY ])
            }
        }
        for (let i = 1; i <= k; i += 1) {
            const nX = x
            const nY = y + i
            if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
            if (safeGet(nX, nY) === null) {
                safeSet(nX, nY, nextStep)
                bfsQueue.push([ nX, nY ])
            }
        }
        for (let i = 1; i <= k; i += 1) {
            const nX = x
            const nY = y - i
            if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
            if (safeGet(nX, nY) === null) {
                safeSet(nX, nY, nextStep)
                bfsQueue.push([ nX, nY ])
            }
        }
    }

    if (safeGet(x2, y2) == null) {
        console.log('-1')
    } else {
        console.log(safeGet(x2, y2))
    }
})()
