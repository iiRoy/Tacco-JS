var fs = require('fs');
var input = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

function pickGraph(g, edge) {
  var from = edge[0],
      to = edge[1],
      copied = g.slice();

  copied[from] = g[from].slice();

  var pos = copied[from].indexOf(to);
  if (pos >= 0) {
    copied[from].splice(pos, 1);
  }

  return copied;
}

function countRoom(g) {
  var d = [];
  var i, j;
  var max = 1;

  for (i = 0; i < n; i++) {
    d[i] = 1;
  }

  for (i = 0; i < n; i++) {
    for (j = 0; j < g[i].length; j++) {
      var next = g[i][j];
      if (d[next] < d[i] + 1) {
        d[next] = d[i] + 1;
      }
    }
  }

  for (i = 0; i < d.length; i++) {
    if (max < d[i]) {
      max = d[i];
    }
  }

  return max;
}

function getNumRoom(g, nodeList) {
  var d = [];
  var i, j, node, len, len2;
  var max = 1;

  for (i = 0, len = nodeList.length; i < len; i++) {
    d[nodeList[i]] = 1;
  }

  for (i = 0, len = nodeList.length; i < len; i++) {
    node = nodeList[i];

    for (j = 0, len2 = g[node].length; j < len2; j++) {
      var target = g[node][j];
      var value = d[node] + 1;

      if (d[target] == null || d[target] < value) {
        d[target] = value;
      }
    }

    if (max < d[node]) {
      max = d[node];
    }
  }

  return max;
}

var temp = input.shift().split(' '),
    n = Number(temp[0]),
    m = Number(temp[1]),
    edges = [],
    graph,
    i, a, b;

var UF = function () {
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

    if (x === y) {
      return false;
    }

    if (par[x] < par[y]) {
      par[x] += par[y];
      par[y] = x;
    } else {
      par[y] += par[x];
      par[x] = y;
    }

    return true;
  }

  function find(x) {
    if (par[x] < 0) {
      return x;
    }
    par[x] = find(par[x]);
    return par[x];
  }

  function getNodeListGroup() {
    for (i = 0; i < n; i++) {
      var root = find(i);
      nodesListGroup[root].push(i);
    }

    nodesListGroup = nodesListGroup.filter(function (e) {
      return e.length > 0;
    });

    nodesListGroup = nodesListGroup.map(function (e) {
      return e.sort(function (a, b) {
        return a - b;
      });
    });

    return nodesListGroup;
  }

  return {
    union: union,
    find: find,
    getNodeListGroup: getNodeListGroup
  };
}();

var g = [];
for (i = 0; i < n; i++) {
  g[i] = [];
}

for (i = 0; i < m; i++) {
  temp = input[i].split(' ');
  a = Number(temp[0]) - 1;
  b = Number(temp[1]) - 1;

  edges.push([a, b]);
  g[a].push(b);
  UF.union(a, b);
}

var nodeListGroup = UF.getNodeListGroup();
console.log(nodeListGroup);

var numRoomList = [];

for (i = 0; i < nodeListGroup.length; i++) {
  numRoomList[i] = getNumRoom(g, nodeListGroup[i]);
}

var maxNum = Math.max.apply(null, numRoomList);
var index = numRoomList.indexOf(maxNum);
var flag = true;
var nodeList = nodeListGroup[index];

if (numRoomList.slice(index + 1).indexOf(maxNum) !== -1) {
  console.log(-1);
  return;
}

for (i = 0; i < m; i++) {
  if (nodeList.indexOf(edges[i][0]) !== -1) {
    graph = pickGraph(g, edges[i]);

    if (getNumRoom(graph, nodeList) < maxNum) {
      console.log(i + 1);
      flag = false;
    }
  }
}

if (flag === true) {
  console.log(-1);
}