function main(input) {
    input = input.split("\n").map(e => e.split(" ").map(ee => Number(ee)))
    const N = input[0][0]
    const info = input.slice(1)
    var T = 0, X = 0, Y = 0
    var ok = true
    for (arr of info) {
        const t = arr[0], x = arr[1], y = arr[2]
        const diffx = Math.abs(x - X)
        const diffy = Math.abs(y - Y)
        const difft = t - T
        // const sum = Math.abs(x) + Math.abs(y)
        if (!((diffx + diffy <= difft) && (t % 2 == (diffx + diffy) % 2))) {
            ok = false
        }
        T = t
        X = x
        Y = y
    }
    const mes = ok ? "Yes" : "No"
    console.log(mes)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
