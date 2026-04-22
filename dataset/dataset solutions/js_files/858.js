/**
 * Created by hiroqn on 13/10/05.
 */

var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');


function pickGraph(g, edge) {
  var a = edge[0],
      b = edge[1],
      g2 = g.slice();
  (g2[a] = g[a].slice()).splice(g[a].indexOf(b), 1);
  return g2;
}

function countRoom(g) {
  var d = [], i, j, max = 1;
  for (i = 0; i < n; i++) {
    d[i] = 1;
  }
  for (i = 0; i < n; i++) {
    for (j = 0; j < g[i].length; j++) {
      d[g[i][j]] = Math.max(d[g[i][j]], d[i] + 1);
    }
//    max = Math.max(max, d[i]);
  }
  return Math.max.apply(null, d);
}
//dp
function getNumRoom(g, nodeList) {
  var d = [], i, j, node, len, len2, max = 1;
  for (i = 0, len = nodeList.length; i < len; i++) {
    d[nodeList[i]] = 1;
  }
  for (i = 0, len = nodeList.length; i < len; i++) {
    node = nodeList[i];
//    d[i]++;
    for (j = 0, len2 = g[node].length; j < len2; j++) {
      d[g[node][j]] = Math.max(d[g[node][j]], d[node] + 1);
    }
    max = Math.max(max, d[node]);
  }
  return max;
}


var temp = input.shift().split(' '),
    n = temp[0],
    m = temp[1],
    edges = [],
    graph,
    graph2,
    i, a, b;
var UF = function () {//union find
  var i,
      par = [],
      nodesListGroup = [];
  for (i = 0; i < n; i++) {
    par[i] = -1;
    nodesListGroup[i] = [];
  }
  function union(x, y) {
    x = find(x);
    y = find(y);
    if (x !== y) {
      if (par[x] < par[y]) {
        par[x] += par[y];
        par[y] = x;
      } else {
        par[y] += par[x];
        par[x] = y;
      }
    }
    return x !== y;
  }

  function find(x) {
    return par[x] < 0 ? x : par[x] = find(par[x]);
  }

  function getNodeListGroup() {
    for (i = 0; i < n; i++) {
      nodesListGroup[find(i)].push(i);
    }
    nodesListGroup = nodesListGroup.filter(function (e, i) {
      return e.length > 0;
    }).map(function (e) {
          return e.sort();
        });
    return nodesListGroup;
  }

  return {
    union: union,
    find: find,
    getNodeListGroup: getNodeListGroup
  };
}();
//make graph and unnion find
var g = [];
for (i = 0; i < n; i++) {
  g[i] = [];
}

for (i = 0; i < m; i++) {
  temp = input[i].split(' ');
  a = temp[0] - 1;
  b = temp[1] - 1;
  edges[i] = [a, b];//edges
  g[a].push(b); // make graph
  UF.union(a, b);// union find
}

var nodeListGroup = UF.getNodeListGroup();
console.log(nodeListGroup);

var numRoomList = nodeListGroup.map(function (nodeList) {//number room group
  return getNumRoom(g, nodeList);
});
//console.log(numRoomList)
var maxNum = Math.max.apply(null, numRoomList),
    index = numRoomList.indexOf(maxNum),
    flag,
    nodeList = nodeListGroup[index];

//console.log(nodeList)
if (~numRoomList.slice(index + 1).indexOf(maxNum)) {
  console.log(-1);
  return;
}

//var edges2 = edges.filter(function (e, i) {
//  return ~nodeList.indexOf(e[0]);
//});

flag = true;
for (i = 0; i < m; i++) {
//  console.log(edges[i][0]);
  if (~nodeList.indexOf(edges[i][0])) {
    graph = pickGraph(g, edges[i]);

    if (getNumRoom(graph, nodeList) < maxNum) {
      console.log(i + 1);
      flag = false;
    }
  }
}
//for (i = 0; i < edges2.length; i++) {
//  graph = pickGraph(g, edges2[i]);
//  console.log(graph)
//  if (getNumRoom(graph, nodeList) < maxNum) {
//    console.log(i + 1);
//    flag = false;
//  }
//}
if (flag) {
  console.log(-1);
}

//var nRooms = countRoom(g);
//flag = true;
//
//
//for (i = 0; i < m; i++) {
//  graph2 = pickGraph(g, edges[i]);
//  if (countRoom(graph2) < nRooms) {
//    console.log(i + 1);
//    flag = false;
//  }
//}