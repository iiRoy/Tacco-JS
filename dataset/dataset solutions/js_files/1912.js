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
  var [n,a,b,c] = nexts(4);
  var s = nexts(n,1);
  var ans = [];
  var NN = "No";
  for(var i = 0; i < n-1; i++){
    if(s[i] === "AB"){
      a--,b--;
      if(a < 0 && b < 0)return NN;
      if(a > b || (s[i+1] !== "AC" && a >= 0)){
        b += 2;
        ans.push("B");
      }else{
        a += 2;
        ans.push("A");
      }
    }
    if(s[i] === "AC"){
      a--,c--;
      if(a < 0 && c < 0)return NN;
      if(a > c || (s[i+1] !== "AB" && a >= 0)){
        c += 2;
        ans.push("C");
      }else{
        a += 2;
        ans.push("A");
      }
    }
    if(s[i] === "BC"){
      c--,b--;
      if(c < 0 && b < 0)return NN;
      if(c > b || (s[i+1] !== "AC" && c >= 0)){
        b += 2;
        ans.push("B");
      }else{
        c += 2;
        ans.push("C");
      }
    }
  }
  if(s[n-1] === "AB"){
    a--,b--;
    if(a < 0 && b < 0)return NN;
    if(a > b)ans.push("B");
    else ans.push("A");
  }else if(s[n-1] === "AC"){
    a--,c--;
    if(a < 0 && c < 0)return NN;
    if(a > c)ans.push("C");
    else ans.push("A");
  }else{
    b--,c--;
    if(b < 0 && c < 0)return NN;
    if(b > c)ans.push("C");
    else ans.push("B");
  }
  console.log("Yes");
  return ans.join("\n");
}