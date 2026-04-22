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

class unionFind{
  constructor(n){this.a=Array(n+1).fill(-1);}
  root(i){
    return this.a[i]<0?i:this.a[i]=this.root(this.a[i]);
  }
  same(x,y){return this.root(x)===this.root(y);}
  unite(x,y){
    const a=this.a;
    x=this.root(x),y=this.root(y);
    if(x===y)return false;
    if(a[y]<a[x])a[y]+=a[x],a[x]=y;
    else a[x]+=a[y],a[y]=x;
    return true;
  }
  size(i){return -this.a[this.root(i)];}
}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));

function main(){
  var n = next(), m = next();
  var uf = new unionFind(n);
  for(var i = 0; i < m; i++){
    var [a,b] = nexts(2);
    uf.unite(a,b);
  }
  return -Math.min(...uf.a);
}