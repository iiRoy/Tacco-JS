/**
 * Created by hiroqn on 13/10/10.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

function UF(n) {//union find
  var i,
      par = [];
  for (i = 0; i < n; i++) {
    par[i] = -1;
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

  function count(using) {
    var c = 0;
    for (i = 0; i < n; i++) {
      if (using[i] && par[i] < 0) {
        c++
      }
    }
    return c;
  }
  function same(x, y){
    return find(x) === find(y);
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
      i, j, k,
      h,
      g,
      edges, e,
      uf,
      res,
      use;
  while (true) {
    temp = input.shift().split(' ');
    n = +temp[0];
    m = +temp[1];

    if (n === 0 && m === 0) {
      break;
    }
    h = [];
    use = [];
    for (i = 0; i < n; i++) {
//      h[i] = [+input.shift() , i];
      h[i] = {
        node: i,
        days: +input.shift()
      };
      use[i] = false;
    }
    edges = [];
//    g = [];
//    for (i = 0; i < n; i++) {
//      g[i] = [];
//      for (j = 0; j < n; j++) {
//        g[i][j] = i == j ? 0 : Infinity;
//      }
//    }
    for (i = 0; i < m; i++) {
      temp = input.shift().split(' ');
      edges[i] = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
//      g[edges[i][0]][edges[i][1]] = g[edges[i][1]][edges[i][0]] = edges[i][2];
    }
//    console.log(g)

    h.sort(function (a, b) {
      return a.days - b.days;
    });

//    uf = UF(n);
//    for (j = 0; j < n; j++) {
//      for (k = 0; k < n; k++) {
//        if (j !== k && g[j][k] !== Infinity) {
//          uf.union(j, k);
//        }
//      }
//    }
//    if (uf.count(use) > 1) {
//      console.log(0);
//      continue;
//    }
    //
    edges.sort(function (e1, e2) {
      return e1[2] - e2[2];
    });
    uf = UF(n);
    res = 0;
    for (i = n - 1; i >= 0; i--) {
      use[h[i].node] = true;
      while (i > 0 && h[i].days === h[i - 1].days) {
        i--;
        use[h[i].node] = true;
      }
      for (j = 0; j < m; j++) {
        e = edges[j];
        if (use[e[0]] && use[e[1]]) {
          if (!uf.same(e[0],e[1])) {
            uf.union(e[0], e[1]);
            res += e[2];
          }
        }
      }
      if (uf.count(use) > 1) {
        res = 0;
        uf = UF(n);
//        break;
      }
    }

    console.log(res);

  }
}