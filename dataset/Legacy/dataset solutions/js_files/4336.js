function Main(input) {
     input = input.split('\n')
     input.pop()
    input = input[0].split(' ')
    var N = input[0],
        M = input[1],
        K = input[2]
    if (K % N == 0 || K % M == 0 ) {
        console.log('Yes')
        return
    }
    if (K < M && K < N) {
        console.log('No')
        return
    }
    for (var i = 1; i <= M; i++) {
        for (var j = 1; j <= N; j++) {
            if (K == (i * M + j * (N - 2 * i))) {
                console.log('Yes')
                return 
            }
        }
    }
    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= M; j++) {
            if (K == (i * N + j * (M - 2 * i))) {
                console.log('Yes')
                return 
            }
        }
    }
    console.log('No')
    return 

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
