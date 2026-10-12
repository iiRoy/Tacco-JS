"use strict";

function SourceTape(text) {
  this.rows = text.split("\n");
  this.row = 0;
  this.slot = 0;
  this.cast = Number;
}

SourceTape.prototype.take = function () {
  var raw = this.rows[this.row];
  if (!raw) return;

  var cells = raw.trim().split(" ");
  var token = cells[this.slot];
  this.slot += 1;

  if (this.slot === cells.length) {
    this.slot = 0;
    this.row += 1;
  }
  return this.cast(token);
};

function buildPrimeTable(ceiling) {
  var found = [];
  for (var value = 2; value <= ceiling; value += 1) {
    var ok = true;
    for (var pos = 0; pos < found.length; pos += 1) {
      var q = found[pos];
      if (q * q > value) break;
      if (value % q === 0) {
        ok = false;
        break;
      }
    }
    if (ok) found.push(value);
  }
  return found;
}

var primeTable = buildPrimeTable(100000);

function euclid(x, y) {
  if (y === 0) return x;
  return euclid(y, x % y);
}

function collectCoefficients(reader, degree) {
  var items = [];
  for (var at = 0; at <= degree; at += 1) {
    items.unshift(reader.take());
  }
  return items;
}

function contentFitsPrime(list, degree, prime) {
  if (list[0] % prime !== 0) return false;

  var width = prime - 1;
  var totals = new Array(width).fill(0);
  for (var index = 1; index <= degree; index += 1) {
    totals[(index - 1) % width] += list[index];
  }

  for (var r = 0; r < totals.length; r += 1) {
    if (totals[r] % prime !== 0) return false;
  }
  return true;
}

function run(programInput) {
  var tape = new SourceTape(programInput);
  var n = tape.take();
  var values = collectCoefficients(tape, n);

  var common = values[0];
  for (var k = 1; k <= n; k += 1) {
    common = Math.abs(euclid(common, values[k]));
  }

  var reduced = values.map(function (entry) {
    return entry / common;
  });

  var out = [];
  for (var pIndex = 0; pIndex < primeTable.length; pIndex += 1) {
    var p = primeTable[pIndex];
    if (p > n) break;
    if (contentFitsPrime(reduced, n, p)) out.push(p);
  }

  var rest = common;
  for (var dIndex = 0; rest > 1 && dIndex < primeTable.length; dIndex += 1) {
    var divisor = primeTable[dIndex];
    if (rest % divisor === 0) {
      out.push(divisor);
      while (rest % divisor === 0) {
        rest = rest / divisor;
      }
    }
  }
  if (rest > 1) out.push(rest);

  out.sort(function (left, right) {
    return left - right;
  });

  var previous;
  for (var i = 0; i < out.length; i += 1) {
    if (previous !== out[i]) console.log(out[i]);
    previous = out[i];
  }
}

run(require("fs").readFileSync("/dev/stdin", "utf8"));
