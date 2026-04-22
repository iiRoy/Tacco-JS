inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
l = inp.shift().split(' ')
H = l.shift() * 1
N = l.shift() * 1
k = []
for (i=0;i<N;i++) {
    k.push(inp.shift().split(' ').map(x => x - 0))
}
dp = [0]
for(h=0;h<=H+1;h++) {
    if (dp[h] === undefined) {
        continue;
    }
    for(i=0;i<N;i++) {
        dp[h+k[i][0]] = (dp[h+k[i][0]] === undefined || dp[h+k[i][0]] > dp[h] + k[i][1]) ? dp[h] + k[i][1] : dp[h+k[i][0]]
    }
}
min = dp[dp.length - 1]
for(j=dp.length - 1; j >= H; j--) {
    if (dp[j] >= min || dp[j] === undefined) {
        dp[j] = min
    } else {
        min = dp[j]
    }
}
console.log(dp[H])

