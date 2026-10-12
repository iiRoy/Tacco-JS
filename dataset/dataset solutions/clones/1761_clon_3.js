"use strict";

var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.trim().split(/ |\n/), cid = 0;

function next(){ return Number(cin[cid++]); }
function nextstr(){ return cin[cid++]; }
function nextbig(){ return BigInt(cin[cid++]); }
function nexts(n, a){
  var ret = cin.slice(cid, cid + n);
  cid += n;
  if(a) return ret;
  return ret.map(function(v){ return +v; });
}
function nextm(h, w, a){
  var r = [];
  for(var i = 0; i < h; i++){
    var row = cin.slice(cid, cid + w);
    cid += w;
    r.push(a ? row : row.map(function(v){ return +v; }));
  }
  return r;
}
function xArray(v){
  var a = arguments;
  function make(d){
    var len = a[d];
    var arr = new Array(len);
    if(d === a.length - 1){
      for(var i = 0; i < len; i++) arr[i] = v;
    }else{
      for(var i = 0; i < len; i++) arr[i] = make(d + 1);
    }
    return arr;
  }
  return make(1);
}

var mod = 998244353;

function mul(){
  var r = arguments[0];
  for(var i = 1; i < arguments.length; i++){
    r = ((r >> 16) * arguments[i] % mod * 65536 + (r & 65535) * arguments[i]) % mod;
  }
  return r;
}

var fac = [], finv = [], invs = [], pow2 = [];

function fset(n){
  fac.length = n + 1;
  fac[0] = 1;
  fac[1] = 1;

  for(var i = 2; i <= n; i++){
    fac[i] = mul(fac[i - 1], i);
  }

  finv.length = n + 1;
  finv[0] = 1;
  finv[1] = 1;
  finv[n] = inv(fac[n]);

  for(i = n; i > 2; i--){
    finv[i - 1] = mul(finv[i], i);
  }
}

function inv(b){
  var a = mod, u = 0, v = 1, t;
  while(b){
    t = a / b | 0;
    a -= t * b;
    u -= t * v;
    t = a;
    a = b;
    b = t;
    t = u;
    u = v;
    v = t;
  }
  u %= mod;
  if(u < 0) u += mod;
  return u;
}

function pow(a, n){
  var r = 1;
  while(n){
    if(n & 1) r = mul(a, r);
    a = mul(a, a);
    n >>= 1;
  }
  return r;
}

function ncr(n, r){
  if(r < 0 || r > n) return 0;
  return mul(fac[n], finv[r], finv[n - r]);
}

function npr(n, r){
  if(r < 0 || r > n) return 0;
  return mul(fac[n], finv[n - r]);
}

function mput(n){
  n %= mod;
  if(n < 0) n += mod;
  return n;
}

var myOut = main();
if(myOut !== undefined){
  console.log(myOut);
}

function main(){
  var data = nexts(4);
  var a = data[0];
  var b = data[1];
  var c = data[2];
  var d = data[3];

  var dp = xArray(0, c + 1, d + 1);
  dp[a][b] = 1;

  for(var y = a; y <= c; y++){
    for(var x = b; x <= d; x++){
      var addY = dp[y - 1][x] * x;
      var addX = dp[y][x - 1] * y;
      var sub = mul(dp[y - 1][x - 1], y - 1, x - 1);

      dp[y][x] = dp[y][x] + addY + addX - sub;
      dp[y][x] %= mod;
    }
  }

  return mput(dp[c][d]);
}