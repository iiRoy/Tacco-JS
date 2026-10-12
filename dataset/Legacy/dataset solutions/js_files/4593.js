"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

function griddist(grid,startx,starty){
  const road = ".", wall = "#", INF = 1e9;
  const h = grid.length, w = grid[0].length;
  const res = Array(h).fill().map(()=>Array(w).fill(INF));
  const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0], dd = 4;
  var q = [startx, starty], dist = 1;
  res[starty][startx] = 0;
  while(q.length){
    var qq = [];
    while(q.length){
      var y = q.pop(), x = q.pop();
      for(var i = 0; i < dd; i++){
        var xx = x+dx[i], yy = y+dy[i];
        if(xx < 0 || xx === w || yy < 0 || yy === h)continue;
        if(grid[yy][xx] === wall || res[yy][xx] !== INF)continue;
        res[yy][xx] = dist;
        qq.push(xx,yy);
      }
    }
    dist++, q = qq;
  }
  return res;
}

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var h = next(), w = next(), k = next();
  var a = nexts(h,1);
  var sx, sy;
  for(var i = 0; i < h; i++){
    var t = a[i].indexOf("S");
    if(t >= 0){
      sx = t, sy = i;
      break;
    }
  }
  var dist = griddist(a,sx,sy);
  var ans = 1e9;
  for(var y = 0; y < h; y++)for(var x = 0; x < w; x++){
    if(dist[y][x] > k)continue;
    var t1 = Math.ceil(y / k);
    var t2 = Math.ceil(x / k);
    var t3 = Math.ceil((h-y-1) / k);
    var t4 = Math.ceil((w-x-1) / k);
    var t = Math.min(t1,t2,t3,t4)+1;
    if(t < ans)ans = t;
  }
  return ans;
}