const Main = (input) => {
    array = input.split('\n')
    NM = array.shift().split(' ').map(item => parseInt(item))
    H = array.shift().split(' ').map(item => parseInt(item))
    array.pop() // lastが邪魔
    A = array.map(item => item.split(' ').map(value => parseInt(value)))
    // console.log('NM: ', NM)
    // console.log('H: ', H)
    // console.log('A: ', A)
    console.log(F(NM[0], NM[1], H, A))
}

const F = (N, M, H, A) => {
    road = []
    for (i = 0; i <= N; i++) {
        road.push([])
    }
    for (i = 0; i < M; i++) {
        road[A[i][0]].push(A[i][1])
        road[A[i][1]].push(A[i][0])
    }
    count = 0
    // console.log('road: ', road)
    for (i = 1; i <= N; i++) {
        // console.log('i: ', i, road[i])
        if (road[i].length == 0) {
            count++
            continue
        }
        max = 0
        road[i].forEach(item => {
            if (H[item - 1] > max) max = H[item - 1]
        });
        if (max < H[i - 1]) count++
    }
    return count
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
