'use strict';

function visitedAll(visited) {
  let flag = true;
  for (let vis of visited) {
    if (vis !== 1) {
      flag = false;
    }
  }
  return flag;
}

function dfs(v, N, graph, visited) {
  if (visitedAll(visited)) {
    count++;
  }


  for (let i = 0; i < N; i++) {
    if (graph[v][i] === 1 && visited[i] === 0) {
      visited[i] = 1;
      dfs(i, N, graph, visited);
      visited[i] = 0;
    }
  }

  return count;

}

function main(input) {
  const tmp = input.split('\n');
  const NM = tmp.shift().split(' ').map((elem) => parseInt(elem, 10));
  const N = NM[0];
  const M = NM[1];

  let graph = Array(N).fill(0).map((elem) => Array(N).fill(0));
  for (let line of tmp) {
    const splited = line.split(' ').map((elem) => parseInt(elem, 10));
    const a = splited[0];
    const b = splited[1];

    graph[a - 1][b - 1] = 1;
    graph[b - 1][a - 1] = 1;
  }
  let visited = Array(N).fill(0);
  visited[0] = 1;
  console.log(dfs(0, N, graph, visited));
}
let count = 0;
main(require('fs').readFileSync('/dev/stdin', 'utf8'));