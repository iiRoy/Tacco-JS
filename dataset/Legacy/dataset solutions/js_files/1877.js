"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var n = next();
  var k = BigInt(next());
  var a = nexts(n);
  var map = xArray(-1,n);
  var x = 0;
  map[0] = 0;
  for(var i = 1; i <= k; i++){
    x = a[x]-1;
    if(map[x] >= 0){
      var r = i - map[x];
      k -= BigInt(i);
      k %= BigInt(r);
      for(var i = 1; i <= k; i++)x = a[x]-1;
    }
    map[x] = i;
  }
  return x+1;
}