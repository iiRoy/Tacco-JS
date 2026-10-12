function Main(input) {
    lines = input.split('\n')
    l = lines.shift().split(' ')
    n = l[0] * 1
    m = l[1] * 1
    cs = lines.shift().split(' ').sort(function (a, b) { return a - b })
    lines.pop()
    ls = lines.sort(function(a, b) { return b.split(' ')[1] - a.split(' ')[1] })
    idx = 0
    for (i = 0; i < ls.length; i++) {
        l = ls[i].split(' ')
        b = l[0] * 1
        c = l[1] * 1
        while (b--) {
            if (cs[idx] === undefined) break;
            if (cs[idx] < c) {
                cs[idx] = c
            } else {
                break;
            }
            idx++
        }
        if (cs[idx] === undefined) break;
    }
    ans = cs.reduce(function(a, c) { return a + c * 1}, 0)
    console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
