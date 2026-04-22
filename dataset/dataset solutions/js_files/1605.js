"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));

function main(){
  var n = next(), k = next();
  var p = nexts(n).map(a=>a-1);
  var c = nexts(n);
  var ans = -2e18, a = Array(n);
  for(var i = 0; i < n; i++){
    var cnt = 1;
    a = a.fill(0);
    var id = p[i];
    a[0] = c[id];
    while(cnt < k && id !== i){
      id = p[id];
      a[cnt] = a[cnt-1] + c[id];
      cnt++;
    }
    cnt;
    if(a[cnt-1] > 0)for(var j = 0; j < cnt; j++){
      var t = BigInt(a[j]) + BigInt(Math.floor((k-j-1)/cnt)) * BigInt(a[cnt-1]);
      if(ans < t)ans = t;
    }else for(var j = 0; j < cnt; j++){
      var t = a[j];
      if(ans < t)ans = t;
    }
  }
  return ans;
}