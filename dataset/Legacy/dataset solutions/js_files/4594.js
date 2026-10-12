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
        S = [h, w];
        break outer;
      }
    }
  }
  function search(h, w, i) {
    if (i > K) return;
    if (h < 0 || H <= h || w < 0 || W <= w) return;
    var p = stage[h][w];
    if (
      p === '.' || p === 'S' ||
      ((typeof p === 'number') && p > i)
    ) {
      stage[h][w] = i;
      search(h-1,w,i+1);
      search(h+1,w,i+1);
      search(h,w-1,i+1);
      search(h,w+1,i+1);
    }
  }
  search(S[0],S[1],0);
  function min_step_to_out(h, w) {
    var a = (H - 1) - h;
    var b = h;
    var c = (W - 1) - w;
    var d = w;
    return Math.min(a, b, c, d);
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
        }
        minimum = Math.min(minimum, Math.ceil(step / K) + 1);
      }
    }
  }
  console.log(minimum);
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));