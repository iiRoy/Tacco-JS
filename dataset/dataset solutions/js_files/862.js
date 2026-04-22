print=console.log;
ls=require("fs").readFileSync("/dev/stdin","utf-8").split("\n");ls.length--
Object.prototype.trace = function(){ print(this+""); return this };
String.prototype.int = function(c){ return this.split(c||" ").map(int)};
ap = Array.prototype;
ap.trace = function(){ print(this); return this };
ap.max = function(){ return Math.max.apply(null, this) };
ap.min = function(){ return Math.min.apply(null, this) };
ap.copy = function(){ return this.map(id) };
ap.rotate = function(n){
  return this.slice(n, this.length).concat(this.slice(0, n));
};
ap.permutation = function () {
  if (this.length == 0) return [];
  if (this.length == 1) return [this];
  var ret=[], ar=this, i=0;
  for (; i<ar.length; ++i)
    ret=ret.concat(ar.slice(0, i)
           .concat(ar.slice(i+1, ar.length))
           .permutation()
           .map(function(p){ return p.concat(ar[i]) }));
  return ret;
};
ap.flatten = function() {
  for (var i=0, ret=[]; i<this.length; ++i) ret=ret.concat(this[i]);
  return ret;
};
ap.nub = function() {
  var that = this;
  return this.filter(function(x, i) {
    return that.slice(i+1).indexOf(x) < 0
  });
};
function iota(n, b, s) {
  b=b||0; s=s||1; for (var ret=[]; n--; b+=s) ret.push(b); return ret;
}
function int(s){return +s}
function add(a,b){return a+b}
function sub(a,b){return a-b}
function bus(a,b){return b-a}
function id(x){return x}

(function main() {
  var n = +ls[0],
      ab = ls[1].int(),
      a = ab[0]-1,
      b = ab[1]-1,
      cd = ls[2].int(),
      c = cd[0]-1,
      d = cd[1]-1;

  var min = n*n;
  function dis(a,b,i) {
    return Math.abs((a%i)-(b%i)) + Math.abs(((a/i)|0)-((b/i)|0))
  }
  for (var i=1; i<n; ++i) {
    var k = dis(a,b,i) + dis(c,d,i);
    // print(i, dis(a,b,i), dis(c,d,i));
    if (min > k) min = k;
  }
  print(min);
})();

// vim: set ft=javascript: