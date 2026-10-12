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
  const aa = 10;
  var n = next();
  var mn = Math.min(n,1<<aa);
  var V = nextm(n,2);
  var q = next();
  var need = xArray("[0]",n);
  for(var i = 0; i < q; i++){
    var u = next()-1, l = next();
    need[u].push(i,l);
    if(need[u][0] < l)need[u][0] = l;
    while(u){
      u = u-1>>1;
      if(need[u][0] >= l)break;
      need[u][0] = l;
    }
  }
  var v = V[0][0], w = V[0][1], mx = need[0][0]+1;
  var dp = Array(aa);
  dp[0] = Array(mx).fill(0,0,w).fill(v,w);
  var ans = xArray(0,q);
  solve(0,0);
  var qq = [];
  if(n > 2)qq = [1,-1,2,1];else if(n === 2)qq = [1,-1];
  while(qq.length){
    var d = qq.pop(), u = qq.pop(), mx = need[u][0]+1;
    if(mx === 1)continue;
    v = V[u][0], w = V[u][1];
    if(d < 0)d = -d, dp[d] = dp[d-1];
    else dp[d] = dp[d-1].slice(0,mx);
    for(var i = mx-1; w <= i; i--)if(dp[d][i] < dp[d][i-w]+v)dp[d][i] = dp[d][i-w]+v;
    solve(u,d);
    u = u+u+1;
    if(n <= u)continue;
    if(d === aa-1){
      var p = u >> 1;
      var qz = [], t = [];
      if(u+1 === n)qz = [u,-1];else qz = [u,0,u+1,-1];
      while(qz.length){
        var z = qz.pop(), u = qz.pop(), mx = need[u][0]+1;
        if(mx === 1)continue;
        if(z >= 0)t.length = z;
        var ln = t.length;
        v = V[u][0], w = V[u][1];
        if(w <= mx)t.push(v,w);
        for(var i = 0; i < ln; i+=2){
          if(t[i+1]+w <= mx)t.push(t[i]+v, t[i+1]+w);
        }
        for(var i = 1; i < need[u].length; i+=2){
          var id = need[u][i], ll = need[u][i+1];
          for(var k = 0; k < t.length; k+=2){
            var vv = t[k], ww = t[k+1];
            if(ll < ww)continue;
            if(ans[id] < dp[d][ll-ww]+vv)ans[id] = dp[d][ll-ww]+vv;
          }
        }
        u = u+u+1;
        if(n <= u)continue;
        if(u+1 === n)qz.push(u,-1);else qz.push(u,t.length,u+1,-1);
      }
    }else{
      d++;
      if(u+1 === n)qq.push(u,-d);else qq.push(u,-d,u+1,d);
    }
  }

  return ans.join("\n");

  function solve(k,d){
    var a = need[k];
    for(var i = 1; i < a.length; i+=2){
      ans[a[i]] = dp[d][a[i+1]];
    }
  }
}