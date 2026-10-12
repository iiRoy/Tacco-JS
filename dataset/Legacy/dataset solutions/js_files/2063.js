"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var n = next();
  var a = next(1);
  var b = Array(n-1);
  for(var i = 0; i < n-1; i++){
    var y = Math.abs(a[i]-a[i+1]);
    b[i] = y;
  }
  while(b.length > 1){
    var bl = b.length, bl2 = bl >> 1, c = Array(bl2);
    for(var i = 0; i < bl2; i++){
      if(b[i] === b[bl-1-i])c[i] = 0;
      else if(Math.abs(b[i] - b[bl-1-i]) === 1)c[i] = 1;
      else c[i] = 2
    }
    b = c;
  }
  return b[0];
}