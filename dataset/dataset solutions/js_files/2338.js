'use strict'

function Main(input) {
  input = input.trim().split('\n')
  const array = input[0].split(' ').map(s => parseInt(s))
  const N = array[0]
  const u = array[1]
  const v = array[2]
  const rest  =input.slice(1)

  const list = rest.map(s => {
    return s.split(' ').map(ss => parseInt(ss))
  })

  var map = {}
  
  for(var i = 0; i < N-1; ++i) {
    var tmp = list[i]
    var a = tmp[0]
    var b = tmp[1]

    if (!map[a]) map[a] = []
    if (!map[b]) map[b] = []
    map[a].push(b)
    map[b].push(a)
  }

  var distA = Array(N+1)
  distA.fill(0)  

  var distB = Array(N+1)
  distB.fill(0)  

  const dfs = (curr, pre, d, dist) => {
    dist[curr] = d // 現在地の距離をいれる
    // console.log(curr, d)
    for(var i in map[curr]) {
      var next = parseInt(map[curr][i])
      if (next!== pre) {
        dfs(next, curr, d + 1, dist)
      }
    }
    // console.log(dist[curr], curr)
  }

  //dfs(u, 0, 0, distA)
  dfs(v, 0, 0, distB)

  var max = 0
  for(var i = 0; i < N+1; ++i) {
    if(distA[i] < distB[i]) {
      max = Math.max(max, distB[i]-1)
    }
  }
  console.log(max)

}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));