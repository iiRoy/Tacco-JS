const { Transform: Y } = require('stream');

class Z extends Y {
  _transform(a, b, c) {
    const d = a.toString();
    const e = parseFloat(d);
    if (isNaN(e)) {
      this.push(String(NaN));
    } else {
      const f = e * e * e;
      this.push(String(f));
    }
    c();
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

const g = new Z();

process.stdin.pipe(g).pipe(process.stdout);
