'use strict'

function dfs(root, list, memo) {
  if (memo[root.toString()]) {
    return memo[root.toString()]
  }
  if (!list[root].length) {
    return 0
  }
  var max = 0
  for (var i = 0; i < list[root].length; i++) {
    max = Math.max(max, 1 + dfs(list[root][i], list, memo))
  }
  memo[root.toString()] = max
  return max
}

function adjList(N, edges) {
  var res = new Array(N+1).fill(0).map(e => [])
  var incoming = new Array(N+1).fill(0)
  for (var i = 0; i < edges.length; i++) {
    res[edges[i][0]].push(edges[i][1])
    incoming[edges[i][1]]++
  }
  return {
    list: res,
    incoming: incoming
  }
}

function solve(N, edges) {
  var adjListRes = adjList(N, edges)
  var list = adjListRes.list
  var incoming = adjListRes.incoming
  var max = 0
  for (var i = 1; i <= incoming.length; i++) {
    if (incoming[i] === 0) {
      var memo = {}
      max = Math.max(max, dfs(i, list, memo))
    }
  }
  return max
}

function main(input) {
  var lines = input.split("\n")
  var NM = lines[0].split(' ').map(i => parseInt(i))
  var N = NM[0]
  var edges = lines.slice(1).map(l => l.split(' ').map(e => parseInt(e)))
  var ans = solve(N, edges)
  return ans
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));