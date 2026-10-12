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
  var [r,c,k] = nexts(3);
  var a = xArray("{}",r+1);
  for(var i = 0; i < k; i++){
    var [u,v,w] = nexts(3);
    a[u][v] = w;
  }
  var dp = xArray(0,c+1,4);
  for(var y = 1; y <= r; y++){
    var dp2 = xArray(0,c+1,4);
    for(var x = 1; x <= c; x++){
      dp2[x][0] = Math.max(dp[x][3], dp2[x-1][0]);
      for(var i = 1; i <= 3; i++){
        if(a[y][x])dp2[x][i] = Math.max(dp[x][3]+a[y][x], dp2[x-1][i-1]+a[y][x], dp2[x-1][i]);
        else dp2[x][i] = Math.max(dp[x][3], dp2[x-1][i]);
      }
    }
    dp = dp2;
  }
  return Math.max(...dp[c]);
}