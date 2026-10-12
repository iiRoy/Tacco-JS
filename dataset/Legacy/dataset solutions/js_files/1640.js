"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

class BIT{
  constructor(n){
    this.a = Array(n+1).fill(0);
  }
  add(val,id){
    for(var x=val,i=id;i<this.a.length;i+=i&-i)this.a[i]+=x;
  }
  get(id){
    for(var r=0,i=id;i;i-=i&-i)r+=this.a[i];
    return r;
  }
}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));

function main(){
  var n = next();
  var q = next();
  var c = nexts(n);
  var cc = xArray("[1]",n);
  var bit = new BIT(n+1);
  var map = new Set();
  for(var i = 0; i < n; i++){
    var t = --c[i];
    cc[t].push(i+1);
    if(!map.has(t))map.add(t), bit.add(1,i+1);
  }
  for(var i = 0; i < n; i++){
    cc[i].push(n+1);
  }
  var lr = Array(q);
  for(var i = 0; i < q; i++){
    lr[i] = [next(), next(), i];
  }
  lr.sort((a,b)=>a[0]-b[0]);
  var ans = Array(q), id = 1;
  for(var i = 0; i < q; i++){
    var [l,r,ix] = lr[i];
    while(id < l){
      var cr = c[id-1];
      var idx = ++cc[cr][0];
      bit.add(-1,id);
      bit.add(1,cc[cr][idx]);
      id++;
    }
    ans[ix] = bit.get(r);
  }
  return ans.join("\n");
}