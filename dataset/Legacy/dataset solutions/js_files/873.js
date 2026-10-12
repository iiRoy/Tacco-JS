/**
 * Created by hiroqn on 13/10/10.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function matrix(n, m, init) {
  var arr = [], i, j;
  for (i = 0; i < n; i++) {
    arr[i] = [];
    for (j = 0; j < m; j++) {
      arr[i][j] = init;
    }
  }
  return arr;
}
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

  return {
    union: union,
    find: find,
    count: count
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
      use[i] = true;
    }
    edges = [];
    g = [];
    for (i = 0; i < n; i++) {
      g[i] = [];
      for (j = 0; j < n; j++) {
        g[i][j] = i == j ? 0 : Infinity;
      }
    }
    for (i = 0; i < m; i++) {
      temp = input.shift().split(' ');
      edges[i] = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
      g[edges[i][0]][edges[i][1]] = g[edges[i][1]][edges[i][0]] = edges[i][2];
    }
//    console.log(g)

//    h.sort(function (a, b) {
//      return a[0] - b[0];
//    });
    h.sort(function (a, b) {
      return a.days - b.days;
    });
    uf = UF(n);
    for (j = 0; j < n; j++) {
      for (k = 0; k < n; k++) {
        if (j !== k && g[j][k] !== Infinity) {
          uf.union(j, k);
        }
      }
    }
    if (uf.count(use) > 1) {
      console.log(0);
      continue;
    }
    for (i = 0; i < n; i++) {
      use[h[i].node] = false;

//      while (i < n - 1 && h[i][0] === h[i + 1][0]) {
      while (i < n - 1 && h[i].days === h[i + 1].days) {
        i++;

        use[h[i].node] = false;
      }
      uf = UF(n);
      for (j = 0; j < n; j++) {
        for (k = 0; k < n; k++) {
          if (use[k] && use[j] && k !== j && g[j][k] !== Infinity) {
            uf.union(j, k);
          }
        }
      }
//      console.log('uf',uf.count(use));

      if (uf.count(use) > 1) {
//        console.log('days', h)
        use[h[i].node] = true;
        while (i > 0 && h[i].days === h[i - 1].days) {
          i--;
          use[h[i].node] = true;
        }
        break;
      }
    }
    //kruskal
    res = 0;
    uf = UF(n);
    edges.sort(function (e1, e2) {
      return e1[2] - e2[2];
    });
    for (j = 0; j < m; j++) {
      e = edges[j];
      if (use[e[0]] && use[e[1]]) {
        if (uf.find(e[0]) !== uf.find(e[1])) {
          uf.union(e[0], e[1]);
          res += e[2];
        }
      }
    }

//    console.log(res)
//    console.log('uf',uf.count(use));
//    console.log(use)
    var stack, d, node;

    for (k = i - 1; k >= 0; k--) {
//      console.log('k',k)
      stack = [];
      stack.push(h[k].node);
      use[h[k].node] = true;
      while (k > 0 && h[k].days === h[k - 1].days) {
        k--;
        stack.push(h[k].node);
        use[h[k].node] = true;
      }
//      queue.sort(function (n1, n2) {
//
//        return e1[2] - e2[2];
//      });
      while (stack.length > 0) {
        node = stack.pop();
        d = Infinity;
        for (j = 0; j < m; j++) {
          e = edges[j];
          if (use[e[0]] && use[e[1]]) {
            if (uf.find(e[0]) !== uf.find(e[1])) {
              uf.union(e[0], e[1]);
              res += e[2];
            }
          }
//          }
        }
//        for (j = 0; j < n; j++) {
//          if (use[j] && j !== node) {
//            d = d > g[node][j] ? g[node][j] : d;
//          }
//        }
//        console.log('d', d, 'node', node);
//        if (d !== Infinity) {
//          res += d;
//        }

      }
    }
    console.log(res);

  }
}