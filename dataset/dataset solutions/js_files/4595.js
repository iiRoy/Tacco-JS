function pint(s)   { return parseInt(s);   }
function pfloat(s) { return parseFloat(s); }
function even(s)   { return (s % 2) === 0; }
function odd(s)    { return (s % 2) === 1; }
Array.prototype.sortNumAsc  = function ()  { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumDesc = function ()  { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStrAsc  = function ()  { return this.sort();                  }
Array.prototype.sortStrDesc = function ()  { return this.sort().reverse();        }
Array.prototype.without     = function (x) { return this.filter(e => e !== x);    }
function main(lines) {
  var arr = lines[0].split(' ').map(pint);
  var H = arr[0];
  var W = arr[1];
  var K = arr[2];
  var S = [];
  var stage = lines.slice(1).map(l => l.split(''));
  outer: for (var h = 0; h < H; h++) {
    for (var w = 0; w < W; w++) {
      if (stage[h][w] === 'S') {
        S = [[h, w]];
        break outer;
      }
    }
  }
  for (var i = 0; i < K; i++) {
    var N = [];
    for (var s = 0, l = S.length; s < l; s++) {
      var hw = S[s];
      var h = hw[0];
      var w = hw[1];
      var p = 4;
      while (p--) {
        var nh, nw;
        switch(p) {
          case 3:
            nh = h-1; nw = w;
            break;
          case 2:
            nh = h+1; nw = w;
            break;
          case 1:
            nh = h; nw = w-1;
            break;
          case 0:
            nh = h; nw = w+1;
            break;
        }
        if (0 <= nh && nh < H &&
            0 <= nw && nw < W &&
            (stage[nh][nw] === '.')
        ) {
          stage[nh][nw] = 'S';
          N.push([nh, nw]);
        }
      }
    }
    S = N;
  }
  var minimum = Infinity;
  outer: for (var h = 0; h < H; h++) {
    for (var w = 0; w < W; w++) {
      var p = stage[h][w];
      if (p === 'S') {
        var step = Math.min(w, h, W-1-w, H-1-h);
        if (step === 0) {
          minimum = 1;
          break outer;
        }
        minimum = Math.min(minimum, Math.ceil(step / K) + 1);
      }
    }
  }
  console.log(minimum);
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));