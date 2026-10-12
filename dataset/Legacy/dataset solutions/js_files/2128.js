"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var BIT = (function(){
  function f(n){return new BIT(n);}
  function BIT(n){
    this.a = Array(n+1).fill(0);
  }
  BIT.prototype.add = function(x,i){
    for(;i<this.a.length;i+=i&-i)this.a[i]+=x;
  };
  BIT.prototype.get = function(i){
    for(var r=0;i;i-=i&-i)r+=this.a[i];
    return r;
  };
  return f;
})();

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var n = next();
  var s = next(1);
  var q = next();
  var bit = Array(26).fill().map(a=>new BIT(n));
  for(var i = 0; i < n; i++){
    bit[s[i].charCodeAt()-97].add(1,i+1);
  }
  var ans = [];
  for(var i = 0; i < q; i++){
    if(next() === 1){
      var j = next(), c = next(1);
      bit[s[j-1].charCodeAt()-97].add(-1,j);
      bit[c.charCodeAt()-97].add(1,j);
    }else{
      var l = next()-1, r = next();
      var cnt = 0;
      for(var j = 0; j < 26; j++){
        if(bit[j].get(r) - bit[j].get(l))cnt++;
      }
      ans.push(cnt);
    }
  }
  return ans.join("\n");
}