function Main(input) {
  lines = input.split("\n")
  N = lines.shift() * 1
  t = {}
  for (i=1; i <= N; i++) {
    t[i] = 0
  }
  for (i=0; i < lines.length - 1; i++) {
    s = lines[i].split(' ')
    t[s[0]] = t[s[0]] + 1
    t[s[1]] = t[s[1]] + 1
  }
  // console.log('t', t)
  k = Object.keys(t).sort(function(a, b) { return t[a] - t[b] })
  // console.log('k', k)
  c = lines[lines.length-1].split(' ').sort(function(a, b) { return a-b })
  // console.log('c', c)
  for (i=0; i < k.length; i++) {
    t[k[i]] = c[i]
  }
  // console.log('t2', t)

  ans = 0
  for (i=0; i < lines.length - 1; i++) {
    s = lines[i].split(' ')
    ans += Math.min(t[s[0]], t[s[1]])
  }
  // console.log('t', t)

  
  console.log(ans + '')
  ans = t[1]
  for (i=2; i <= k.length; i++) {
    ans = ans + ' ' + t[i]
  }
  console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));