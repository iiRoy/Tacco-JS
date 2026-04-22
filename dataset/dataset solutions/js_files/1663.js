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
  var inf = 1e9;
  var n = next();
  var a = xArray("[]",4);
  var s = {U:0,R:1,D:2,L:3};
  for(var i = 0; i < n; i++){
    var x = next(), y = next(), U = nextstr();
    a[s[U]].push([x,y,x-y,x+y]);
  }
  var ans = inf;
  for(var i = 0; i < 4; i++){
    var j = i&1;
    a[i].sort((a,b)=>a[j]>b[j]?1:a[j]<b[j]?-1:a[1-j]-b[1-j]);
  }
  for(var k = 0; k < 2; k++){
    var id = 0;
    if(a[k+2].length)for(var i = 0; i < a[k].length; i++){
      while(a[k+2].length > id && a[k+2][id][k] < a[k][i][k])id++;
      while(a[k+2].length > id && a[k+2][id][k] === a[k][i][k] && a[k][i][1-k] > a[k+2][id][1-k])id++;
      if(id === a[k+2].length)break;
      if(a[k][i][k] === a[k+2][id][k]){
        ans = Math.min(ans,a[k+2][id][1-k]-a[k][i][1-k]);
      }
    }
  }
  for(var i = 0; i < 4; i++){
    var j = 1-(i&1);
    a[i].sort((a,b)=>a[3]>b[3]?1:a[3]<b[3]?-1:a[j]-b[j]);
  }
  for(var k = 0; k < 4; k+=2){
    var id = 0;
    if(a[k+1].length)for(var i = 0; i < a[k].length; i++){
      while(a[k+1].length > id && a[k+1][id][3] < a[k][i][3])id++;
      while(a[k+1].length > id && a[k+1][id][3] === a[k][i][3] && a[k][i][1-k/2] > a[k+1][id][1-k/2])id++;
      if(id === a[k+1].length)break;
      if(a[k][i][3] === a[k+1][id][3]){
        ans = Math.min(ans,(a[k+1][id][1-k/2]-a[k][i][1-k/2])*2);
      }
    }
  }
  for(var i = 0; i < 4; i++){
    a[i].sort((a,b)=>a[2]>b[2]?1:a[2]<b[2]?-1:a[0]-b[0]);
  }
  for(var k = 0; k < 2; k++){
    var id = 0;
    if(a[3-k].length)for(var i = 0; i < a[k].length; i++){
      while(a[3-k].length > id && a[3-k][id][2] < a[k][i][2])id++;
      while(a[3-k].length > id && a[3-k][id][2] === a[k][i][2] && a[k][i][0] > a[3-k][id][0])id++;
      if(id === a[3-k].length)break;
      if(a[k][i][2] === a[3-k][id][2]){
        ans = Math.min(ans,(a[3-k][id][0]-a[k][i][0])*2);
      }
    }
  }
  return ans === inf ? "SAFE" : ans*5;
}