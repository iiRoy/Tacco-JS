function Main(input) {
  lines = input.split("\n")
  lines.pop()
  N = lines.shift() * 1
  d = []
  for (i =0; i < N; i++) {
     l = lines[i].split(' ')
     d.push({ x: l[0], y: l[1]})
  }
  d = d.sort(function(a, b) {
    if (a.x == b.x) {
      return a.y - b.y
    }
    return a.x - b.x
  })
  a = {}
  for (i =0; i < N; i++) {
    for (j =0; j < N; j++) {
      if (i == j) continue
      x = d[i].x - d[j].x
      y = d[i].y - d[j].y
      k = x + ',' + y
      if (a[k]) {
        a[k] = a[k] + 1
      } else {
        a[k] = 1
      }
    }
  }
  arr = Object.keys(a)
  m = 0
  for (i=0; i< arr.length; i++) {
    if (m < a[arr[i]]) {
      m = a[arr[i]]
      k = arr[i]
    }
  }
  dx = k.split(',')[0]
  dy = k.split(',')[1]
  ans = 0
  while(d.length) {
     a = d.shift()
     b = d[i]
     for (i= 0; i < d.length; i++) {
       b = d[i]
       if (
         ((dx == 0 && b.x - a.x == 0) || (b.x - a.x) % dx == 0) &&
         ((dy == 0 && b.y - a.y == 0) || (b.y - a.y) % dy == 0)
       ) {
         d.splice(i, 1)
         i--
       }
     }
     ans++
  }
  console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

