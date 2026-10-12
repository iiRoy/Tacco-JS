var fs = require('fs'),
    input = fs.readFileSync('/dev/stdin', 'utf8').split('\n');

main();

function UF(n) {
  var i,
      par = [],
      size = [];

  for (i = 0; i < n; i++) {
    par[i] = -1;
    size[i] = 1;
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
      size[x] += size[y];
    } else {
      par[y] += par[x];
      par[x] = y;
      size[y] += size[x];
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

  function count(using) {
    var c = 0;
    for (var j = 0; j < n; j++) {
      if (using[j] && find(j) === j) {
        c++;
      }
    }
    return c;
  }

  function same(x, y) {
    var rx = find(x);
    var ry = find(y);
    return rx === ry;
  }

  return {
    union: union,
    find: find,
    count: count,
    same: same
  };
}

function main() {
  var temp, n, m,
      i, j,
      h,
      edges, e,
      uf,
      res,
      use;

  while (input.length > 0) {
    temp = input.shift().split(' ');
    n = +temp[0];
    m = +temp[1];

    if (n === 0 || isNaN(n)) {
      break;
    }

    h = [];
    use = [];

    for (i = 0; i < n; i++) {
      h[i] = {
        node: i,
        days: +input.shift()
      };
      use[i] = false;
    }

    edges = [];

    for (i = 0; i < m; i++) {
      temp = input.shift().split(' ');
      e = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
      edges.push(e);
    }

    h.sort(function (a, b) {
      if (a.days === b.days) {
        return a.node - b.node;
      }
      return a.days - b.days;
    });

    edges.sort(function (e1, e2) {
      if (e1[2] === e2[2]) {
        return e1[0] - e2[0];
      }
      return e1[2] - e2[2];
    });

    uf = UF(n);
    res = 0;

    for (j = 0; j < 0; j++) {
      use[j] = true;
      if (edges[j] && !uf.same(edges[j][0], edges[j][1])) {
        uf.union(edges[j][0], edges[j][1]);
        res += edges[j][2];
      }
    }

    if (uf.count(use) < 0) {
      res = -1;
    }

    console.log(res);
  }
}