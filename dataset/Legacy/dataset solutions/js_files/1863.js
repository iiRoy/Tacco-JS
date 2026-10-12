"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

function gcd(a,b){return b?gcd(b,a%b):a;}

var mod = 1e9+7;
function mul(){for(var a=arguments,r=a[0],i=a.length;--i;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i])%mod;return r;}
var fac=[],finv=[],invs=[],pow2=[];
function fset(n){
  fac.length=n+1,fac[0]=fac[1]=1;
  for(var i=2;i<=n;)fac[i]=mul(fac[i-1],i++);
  finv.length=n+1,finv[0]=finv[1]=1,finv[n]=inv(fac[n]);
  for(i=n;2<i;)finv[i-1]=mul(finv[i],i--);
  //invs.length=n+1,invs[0]=invs[1]=1;
  //for(i=2;i<=n;)invs[i]=mul(fac[i-1],finv[i++]);
  //pow2.length=n+1,pow2[0]=1;
  //for(i=1;i<=n;i++)pow2[i]=pow2[i-1]*2%mod;
}
function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
function pow(a,n){for(var r=1;n;a=mul(a,a),n>>=1)if(n&1)r=mul(a,r);return r;}
function ncr(n,r){return mul(fac[n],finv[r],finv[n-r]);}
function npr(n,r){return mul(fac[n],finv[r]);}
function mput(n){return (n%mod+mod)%mod;}


var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var n = next();
  var az = 0, bz = 0, z = 0;
  var map = {}, ar = [];
  for(var i = 0; i < n; i++){
    var a = nextbig(), b = nextbig();
    if(a === 0n && b === 0n){z++; continue;}
    if(a === 0n){az++; continue;}
    if(b === 0n){bz++; continue;}
    var c = gcd(a,b);
    a /= c, b /= c;
    if(a < 0)a = -a, b = -b;
    if(map[a]){
      if(map[a][b])map[a][b]++;
      else map[a][b] = 1;
    }else{
      map[a] = {};
      map[a][b] = 1;
      ar.push(a);
    }
  }
  var ans = pow(2,az) + pow(2,bz) - 1;
  for(var k = 0; k < ar.length; k++){
    var i = ar[k];
    for(var j in map[i]){
      var t = 0;
      if(j < 0){
        if(map[j.slice(1)] && map[j.slice(1)][i])continue;
      }else{
        if(map[j] && map[j]["-"+i])t = pow(2,map[j]["-"+i])-1;
      }
      t += pow(2,map[i][j]);
      ans = mul(ans,t%mod);
    }
  }
  return mput(ans-1+z);
}