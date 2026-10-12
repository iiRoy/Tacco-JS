function pint(s)   { return parseInt(s, 10); }
function pfloat(s) { return parseFloat(s);   }
function even(s)   { return (s % 2) === 0;  }
function odd(s)    { return (s % 2) !== 0;  }
Array.prototype.sortNumAsc  = function ()  { return this.sort(function(a, b){ return a - b; }); }
Array.prototype.sortNumDesc = function ()  { return this.sort(function(a, b){ return b - a; }); }
Array.prototype.sortStrAsc  = function ()  { return this.sort();                  }
Array.prototype.sortStrDesc = function ()  { return this.sort().reverse();        }
Array.prototype.without     = function (x) { return this.filter(function(e){ return e !== x; }); }

function main(lines) {
  var arr = lines[0].split(' ').map(pint);
  var H = arr[0];
  var W = arr[1];
  var K = arr[2];
  var S = [-1, -1];
  var stage = [];

  for (var i = 1; i <= H; i++) {
    stage.push(lines[i].split(''));
  }

  outer: for (var h = 0; h < H; h++) {
    for (var w = 0; w < W; w++) {
      if (stage[h][w] === 'S') {
        S[0] = h;
        S[1] = w;
        break outer;
      }
    }
  }

  function search(h, w, i) {
    var q = [[h, w, i]];
    var head = 0;

    while (head < q.length) {
      var cur = q[head++];
      var y = cur[0];
      var x = cur[1];
      var d = cur[2];

      if (d > K) continue;
      if (y < 0 || H <= y || x < 0 || W <= x) continue;

      var p = stage[y][x];

      if (
        p === '.' || p === 'S' ||
        ((typeof p === 'number') && p > d)
      ) {
        stage[y][x] = d;

        if (d + 1 <= K) {
          q.push([y - 1, x, d + 1]);
          q.push([y + 1, x, d + 1]);
          q.push([y, x - 1, d + 1]);
          q.push([y, x + 1, d + 1]);
        }
      }
    }
  }

  search(S[0], S[1], 0);

  function min_step_to_out(h, w) {
    var a = H - 1 - h;
    var b = h;
    var c = W - 1 - w;
    var d = w;
    var m = Math.min(a, b);
    return Math.min(m, Math.min(c, d));
  }

  var minimum = Infinity;

  outer: for (var h = 0; h < H; h++) {
    for (var w = 0; w < W; w++) {
      var p = stage[h][w];

      if (typeof p === 'number') {
        var step = min_step_to_out(h, w);

        if (step === 0) {
          minimum = 1;
          break outer;
        } else {
          var candidate = Math.ceil(step / K) + 1;
          if (candidate < minimum) {
            minimum = candidate;
          }
        }
      }
    }
  }

  console.log(minimum);
}

main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(function(l){ return l.trim(); }));