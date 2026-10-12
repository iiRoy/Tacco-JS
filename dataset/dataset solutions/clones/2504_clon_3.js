module.exports = (function (mods) {
  var cache = {};
  function req(id) {
    if (cache[id]) return cache[id].exports;
    var mod = (cache[id] = { i: id, l: !1, exports: {} });
    mods[id].call(mod.exports, mod, mod.exports, req);
    mod.l = !0;
    return mod.exports;
  }
  return (
    (req.m = mods),
    (req.c = cache),
    (req.d = function (obj, key, get) {
      if (!req.o(obj, key)) {
        Object.defineProperty(obj, key, { enumerable: !0, get: get });
      }
    }),
    (req.r = function (obj) {
      if ("undefined" != typeof Symbol && Symbol.toStringTag) {
        Object.defineProperty(obj, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(obj, "__esModule", { value: !0 });
    }),
    (req.t = function (val, mode) {
      if (1 & mode) val = req(val);
      if (8 & mode) return val;
      if (4 & mode && "object" == typeof val && val && val.__esModule) return val;
      var ns = Object.create(null);
      req.r(ns);
      Object.defineProperty(ns, "default", { enumerable: !0, value: val });
      if (2 & mode && "string" != typeof val) {
        for (var k in val) {
          req.d(
            ns,
            k,
            function (x) {
              return val[x];
            }.bind(null, k),
          );
        }
      }
      return ns;
    }),
    (req.n = function (val) {
      var get =
        val && val.__esModule
          ? function () {
              return val.default;
            }
          : function () {
              return val;
            };
      req.d(get, "a", get);
      return get;
    }),
    (req.o = function (obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }),
    (req.p = ""),
    req((req.s = 0))
  );
})([
  function (module, exports, req) {
    "use strict";
    var fs = req(1);
    var runner = req(2);
    var text = fs.readFileSync("/dev/stdin", "utf8");
    runner(text);
  },
  function (module, exports) {
    module.exports = require("fs");
  },
  function (module, exports, req) {
    "use strict";
    var Scanner = req(3);
    var solve = req(5);
    module.exports = function (src) {
      var input = new Scanner(src);
      solve(input);
      input.fin();
    };
  },
  function (module, exports, req) {
    "use strict";
    var Queue = req(4);
    module.exports = class {
      constructor(src) {
        var arr = src.trim().split(/\s+/g);
        this.inp = new Queue(arr);
      }
      inr() {
        return this.inp.deq();
      }
      in() {
        var v = this.inp.deq();
        return parseInt(v, 10);
      }
      fin() {
        this.inp.clear();
      }
    };
  },
  function (module, exports, req) {
    "use strict";
    module.exports = class {
      constructor(list) {
        list = list || [];
        this.items = list;
        this.ind = 0;
        this.size = list.length;
      }
      enq(v) {
        this.items[this.items.length] = v;
        this.size++;
      }
      deq() {
        if (this.ind >= this.items.length) return void 0;
        var v = this.items[this.ind];
        this.ind++;
        this.size--;
        return v;
      }
      clear() {
        this.items.length = 0;
        this.ind = 0;
        this.size = 0;
      }
    };
  },
  function (module, exports, req) {
    "use strict";
    var warshall = req(6);
    module.exports = function (sc) {
      var n = sc.in(),
        m = sc.in(),
        limit = sc.in(),
        INF = 9999999999,
        dist = new Array(n),
        i,
        j;

      for (i = 0; i < n; i++) {
        dist[i] = new Array(n);
        for (j = 0; j < n; j++) {
          dist[i][j] = i === j ? 0 : INF;
        }
      }

      for (i = 0; i < m; i++) {
        var a = sc.in() - 1,
          b = sc.in() - 1,
          c = sc.in();
        if (c < dist[a][b]) {
          dist[a][b] = c;
          dist[b][a] = c;
        }
      }

      var shortest = warshall(dist);

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (i === j) {
            dist[i][j] = 0;
          } else if (shortest[i][j] <= limit) {
            dist[i][j] = 1;
          } else {
            dist[i][j] = INF;
          }
        }
      }

      var fuel = warshall(dist);
      var q = sc.in();
      var out = [];

      for (i = 0; i < q; i++) {
        var s = sc.in() - 1,
          t = sc.in() - 1,
          ans = fuel[s][t];
        if (ans >= INF) {
          out.push("-1");
        } else {
          out.push(String(ans - 1));
        }
      }

      console.log(out.join("\n"));
    };
  },
  function (module, exports, req) {
    "use strict";
    module.exports = function (mat) {
      var n = mat.length;
      var res = new Array(n);

      for (var y = 0; y < n; y++) {
        res[y] = mat[y].slice();
      }

      for (var k = 0; k < n; k++) {
        for (var i = 0; i < n; i++) {
          if (res[i][k] >= 9999999999) continue;
          for (var j = 0; j < n; j++) {
            var nd = res[i][k] + res[k][j];
            if (res[i][j] > nd) {
              res[i][j] = nd;
            }
          }
        }
      }

      return res;
    };
  },
]);