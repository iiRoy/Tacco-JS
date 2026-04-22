function pint(s) { return parseInt(s); }
function pfloat(s) { return parseFloat(s); }
Array.prototype.sortNumAsc  = function () { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumDesc = function () { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStrAsc  = function () { return this.sort();                  }
Array.prototype.sortStrDesc = function () { return this.sort().reverse();        }
Array.prototype.without = function (itm) { return this.filter((elem) => elem !== itm); }
var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  var lines = input.split('\n').map(l => l.trim());
  if (lines[lines.length-1] === '')
    lines = lines.slice(0, -1);
  main(lines);
});
function main(lines) {
  var arr = lines[0].split(' ').map(pint);
  var N = arr[0];
  var W = arr[1];
  var V = 0;
  lines = lines.slice(1).map(l => l.split(' ').map(pint));
  function iter(ai, aw, av) {
    if (ai === N) {
      console.log(V);
      process.exit();
    }
    for (var i = ai, l = N; i < l; i++) {
      var w = lines[i][0];
      var v = lines[i][1];
      if (w + aw <= W) {
        V = Math.max(V, v + av);
        iter(i+1, w + aw, v + av);
      }
    }
  }
  iter(0, 0, 0);
  console.log(V);
}