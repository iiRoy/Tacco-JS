"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextssort(n,a){return a?cin.slice(cid,cid+=n).map(a=>+a).sort((a,b)=>b-a):cin.slice(cid,cid+=n).map(a=>+a).sort((a,b)=>a-b);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var streams=[];function print(s){streams.push(s);}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));
if(streams.length)console.log(streams.join("\n"));

function main(){
  var n = next();
  if(n === 1)return 1;
  var x1 = n;
  var x2 = 2;
  while(x1 % 2 === 0)x1 /= 2, x2 *= 2;
  var n2 = n*2, ans = n2-1;
  for(var i = 1; i*i <= x1; i+=2){
    if(x1 % i)continue;
    var u = x1 / i;
    var f1 = f(u,i*x2), f2 = f(u*x2,i);
    ans = Math.min(ans, f1, f2);
  }
  return ans;
}
function f(u,v){
  var [a,b,c] = exgcd(u,v);
  if(c > 1)return 9e15;
  if(a < 0)return -a*u;
  if(b < 0)return -b*v;
  return 9e15;
}
function exgcd(x,y){
  var a0 = 1n, a1 = 0n, b0 = 0n, b1 = 1n;
  x = BigInt(x), y = BigInt(y);
  while(y){
    var q1 = x / y;
    var r2 = x % y;
    var a2 = a0 - q1*a1;
    var b2 = b0 - q1*b1
    x = y, y = r2;
    a0 = a1, a1 = a2;
    b0 = b1, b1 = b2;
  }
  return [Number(a0),Number(b0),x];
}