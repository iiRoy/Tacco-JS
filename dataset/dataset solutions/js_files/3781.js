function Main(s){
  s = s.split(" ").map(a=>+a);
  var n = s[0];
  var a = s[1];
  var b = s[2];
  var c = a + b;
  var k = s[3];
  var j = Math.floor(k / c);
  var f = 0;
  var z = [];
  for(var i = j; i >= 0;i--){
    if((k - i * c) % a === 0){
      f = 1;
      z.push((k - i * c) / a, 0);
    }
    if((k - i * c) % b === 0){
      f = 1;
      z.push(0, (k - i * c) / b);
    }
    if(f)break;
  }
  j = i;
  if(!f){console.log(0);return;}
  var ans = 0;
  var aa = (c % a === 0 ? c / a : 0);
  var bb = (c % b === 0 ? c / b : 0);
  while(z.length && j >= 0){
    var y = [];
    var x = {};
    for(i = 0; i < z.length; i += 2){
      if(x[z[i]+"a"+z[i+1]])continue;
      if(z[i] < 0 || z[i+1] < 0 || j+z[i]+z[i+1] > n)continue;
      x[z[i]+"a"+z[i+1]] = 1;
      ans += abmod(nCrmod(n, j), nCrmod(n - j, z[i]), nCrmod(n - j - z[i], z[i+1]));
      ans %= mod;
      y.push(z[i] + 1, z[i+1] + 1);
      if(aa)y.push(z[i] + aa, z[i+1]);
      if(bb)y.push(z[i], z[i+1] + bb);
    }
    z = y;
    j--;
  }
  
  console.log(ans);
}
function abmod(){
  var rt = arguments[0];
  for(var i = 1; i < arguments.length; i++){
    rt = (rt >>> 16) * arguments[i] % mod * 0x10000 + (rt & 0xFFFF) * arguments[i];
    rt %= mod;
  }
  return rt;
}
function powmod(a,n){
  var rt = 1;
  while(n){
    if(n & 1) rt = abmod(a, rt);
    a = abmod(a, a);
    n >>>= 1;
  }
  return rt;
}
var mod = 998244353;
var fact = [1,1];
var factinv = [1,1];
function factmod(n){
  for(var i = fact.length; i <= n; i++){
    fact[i] = abmod(fact[i-1], i);
  }
  return fact[n];
}
function factinvmod(n){
  if(!fact[n]) factmod(n);
  factinv[n] = powmod(fact[n], mod-2);
  while(!factinv[n-1]){
    factinv[n-1] = abmod(factinv[n], n--);
  }
}
function nCrmod(n, r){
  if(!factinv[n]) factinvmod(n);
  return abmod(fact[n], factinv[r], factinv[n-r]);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));