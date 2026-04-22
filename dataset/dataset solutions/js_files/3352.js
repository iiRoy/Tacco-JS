'use strict'

var mod = 1e9 + 7

function dfs(root, adj, visited) {
  var ans = [1, 1]
  for (var i = 0; i < adj[root].length; i++) {
    if (!visited[adj[root][i]]) {
      visited[adj[root][i]] = 1
      var res = dfs(adj[root][i], adj, visited)
      ans[0] = (ans[0] * (res[0] + res[1])) % mod
      ans[1] = (ans[1] * res[0]) % mod
    }
  }
  return ans
}

function adjList(N, E) {
  var list = new Array(N+1).fill(0).map(e => new Array())
  for (var i = 0; i < E.length; i++) {
    var src = E[i][0]
    var dest = E[i][1]
    list[src].push(dest)
    list[dest].push(src)
  }
  return list
}

function solve(N, E) {
  var adj = adjList(N, E)
  //var visited = new Array(N+1).fill(0)
  //visited[1] = 1
  // res = dfs(1, adj, visited)
  return 0
}

function main(input) {
  var lines = input.split("\n")
  var N = parseInt(lines[0])
  var E = lines.slice(1).map(l => l.split(' ').map(e => parseInt(e)))
  var ans = solve(N, E)
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
