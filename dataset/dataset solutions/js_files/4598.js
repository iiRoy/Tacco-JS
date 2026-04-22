function pint(s) { return parseInt(s); }
function pfloat(s) { return parseFloat(s); }
Array.prototype.sortNumAsc  = function () { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumDesc = function () { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStrAsc  = function () { return this.sort();                  }
Array.prototype.sortStrDesc = function () { return this.sort().reverse();        }
Array.prototype.without = function (itm) { return this.filter((elem) => elem !== itm); }
let input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => { let lines = input.split('\n').map(l => l.trim()); if (lines[lines.length-1] === '') lines = lines.slice(0, -1); main(lines); });
function main(lines) {
  let [a, b, c] = lines[0].split(' ').map(x => x.trim());
  console.log(
    (a[a.length-1] === b[0] &&
     b[b.length-1] === c[0]) ?
    "YES" : "NO");
}