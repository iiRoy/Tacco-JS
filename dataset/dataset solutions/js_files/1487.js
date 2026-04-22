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
var streams=[];function print(s){streams.push(s);}

class BIT{//1-indexed
  constructor(n){
    this.a = Array(n+1).fill(0);
  }
  add(val,id){
    for(var i=id,a=this.a;i<a.length;i+=i&-i)a[i]+=val;
  }
  get(id){
    for(var r=0,i=id;i;i-=i&-i)r+=this.a[i];
    return r;
  }
  range(l,r){//[l,r]
    return this.get(r) - this.get(l-1);
  }
}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));
if(streams.length)console.log(streams.join("\n"));

function main(){
  var [n,k] = nexts(2);
  var a = nexts(n);
  var bi = new BIT(300001);
  for(var i = 0; i < n; i++){
    var l = Math.max(0,a[i]-k);
    var r = Math.min(300000,a[i]+k);
    bi.add(1,l+1);
    bi.add(-1,r+1);
  }
  var ans = 0;
  for(var i = 0; i < n; i++){
    ans = Math.max(ans,bi.get(i+1));
  }
  return ans;
}