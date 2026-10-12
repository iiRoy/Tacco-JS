"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cx=0;
function next(){return +cin[cx++];};
function nexts(){return cin[cx++];};
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

var leng = 0, nextV = 0, day = 0, takeday = -1;
var score = 0;

const INF = 1e9;
const V = next(); //200-400
const E = next(); //1.5V-2V
const dist = xArray(INF,V,V);
const e = xArray("new Set()",V);
getE();
const tmax = next(); //10000
const tmax2 = tmax*tmax;
const ans = Array(tmax);
const has = new Set();
const orderTime = xArray("[]",V);

console.log(main());
function main(){
  for(var k = 0; k < V; k++)
  for(var i = 0; i < V; i++)
  for(var j = 0; j < V; j++){
    if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
  }
  while(day < tmax){
    ans[day] = solve()+1;
    day++;
  }
  return ans.join("\n");
}

function getE(){
  for(var i = 0; i < V; i++)dist[i][i] = 0;
  for(var i = 0; i < E; i++){
    var v1 = next()-1, v2 = next()-1, d = next();
    dist[v1][v2] = dist[v2][v1] = d;
    e[v1].add(v2);
    e[v2].add(v1);
  }
}

function deliver(){
  if(has.size === 0){
    if(nextV === 0)return -2;
    return minPath(nextV,0);
  }
  var maxid = -1, max = 0;
  for(var v of has){
    if(max < orderTime[v].length)
    if(dist[nextV][v] <= tmax-day){
      maxid = v, max = orderTime[v].length;
    }
  }
  if(maxid === -1){
    if(nextV === 0)return -2;
    return minPath(nextV,0);
  }
  return minPath(nextV,maxid);
}

function minPath(from,to){
  if(e[from].has(to)){
    leng = dist[from][to]-1;
    return nextV = to;
  }
  for(var v of e[from]){
    if(dist[from][to] === dist[from][v]+dist[v][to]){
      leng = dist[from][v]-1;
      return nextV = v;
    }
  }
  return -2;
}

function solve(){
  if(leng){
    leng--;
    return nextV;
  }
  if(nextV === 0)take();
  else give();
  return deliver();
}

function take(){
  while(takeday < day){
    takeday++;
    var n = next();
    for(var i = 0; i < n; i++){
      var id = next()-1, d = next()-1;
      has.add(d);
      orderTime[d].push(takeday);
    }
  }
}

function give(){
  has.delete(nextV);
  while(orderTime[nextV].length){
    var t = day - orderTime[nextV].pop();
    score += tmax2 - t*t;
  }
}