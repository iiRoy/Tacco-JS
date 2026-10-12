"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
function lower_bound(d,e,a=0,b=d.length){for(var c;1<b-a;)d[c=a+b>>1]<e?a=c:b=c;return d[a]<e?b:a};

var ans, dp = [0];
var g,a;
var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var n = next();
  a = nexts(n);
  g = xArray("[]",n);
  for(var i = 1; i < n; i++){
    var u = next()-1, v = next()-1;
    g[u].push(v);
    g[v].push(u);
  }
  ans = xArray(0,n);
  dfs(0,-1);
  return ans.join("\n");
}

function dfs(v,p){
  var ix = lower_bound(dp,a[v]),iv;
  if(ix !== dp.length){
    iv = dp[ix];
    dp[ix] = a[v];
  }else ix++,dp.push(a[v]);
  ans[v] = dp.length-1;
  for(var i = 0; i < g[v].length; i++){
    var V = g[v][i];
    if(V === p)continue;
    dfs(V,v);
  }
  if(ix === dp.length)dp.pop();
  else dp[ix] = iv;
}