"use strict";
var GET=(function(){
  function f(s){return new g(s);}
  function g(s){
    this._s=s.trim().split("\n");
    this._y=0;
  }
  g.prototype.a=function(f){
    var s=this._s, y=this._y, r;
    if(typeof s[y]==="string"){
      s[y]=s[y].trim().split(" ").reverse();
    }
    r=s[y].pop();
    if(!s[y].length)this._y++;
    return f?r:+r;
  };
  g.prototype.l=function(f){
    var s=this._s[this._y++].split(" ");
    return f?s:s.map(function(a){return +a;});
  };
  g.prototype.m=function(n,f){
    var r=this._s.slice(this._y,this._y+=n).map(function(a){return a.split(" ");});
    return f?r:r.map(function(a){return a.map(function(b){return +b;});});
  };
  g.prototype.r=function(n,f){
    var r=this._s.slice(this._y,this._y+=n);
    return f?r:r.map(function(a){return +a;});
  };
  return f;
})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

function xArray(v){
  var a=arguments;
  function build(d){
    var len=a[d];
    if(d===a.length-1){
      return Array(len).fill(0).map(function(){return v;});
    }
    return Array(len).fill(0).map(function(){return build(d+1);});
  }
  return build(1);
}

var ans,s;

console.log(main());

function main(){
  var h=o.a();
  var w=o.a();
  var k=o.a();

  s=o.r(h,1);
  ans=xArray(0,h,w);

  solve(0,0,h,w,1,k);

  return ans.map(function(a){
    return a.join(" ");
  }).join("\n");
}

function solve(y,x,h,w,id,k){
  if(k<=1){
    for(var y3=y;y3<h;y3++){
      for(var x3=x;x3<w;x3++){
        ans[y3][x3]=id;
      }
    }
    return;
  }

  var y2=xArray(0,h-y);
  var x2=xArray(0,w-x);

  for(var y3=y;y3<h;y3++){
    for(var x3=x;x3<w;x3++){
      if(s[y3][x3]==="#"){
        y2[y3-y]=y2[y3-y]+1;
        x2[x3-x]=x2[x3-x]+1;
      }
    }
  }

  for(var yy=1;yy<y2.length;yy++){
    y2[yy]+=y2[yy-1];
  }
  for(var xx=1;xx<x2.length;xx++){
    x2[xx]+=x2[xx-1];
  }

  if(w-x===1){
    return f(y,x,h,w,id,k,y2);
  }

  var xf=((x+w)>>1)-x;

  while(xf<x2.length-1 && x2[xf]===0){
    xf++;
  }
  if(x2[xf]===0 || x2[xf]===k){
    return f(y,x,h,w,id,k,y2);
  }

  solve(y,x,h,x+xf+1,id,x2[xf]);
  solve(y,x+xf+1,h,w,id+x2[xf],k-x2[xf]);
}

function f(y,x,h,w,id,k,y2){
  var yf=((y+h)>>1)-y;

  while(yf<y2.length-1 && y2[yf]===0){
    yf++;
  }
  while(yf>0 && y2[yf]===k){
    yf--;
  }

  if(y2[yf]===0 || y2[yf]===k){
    yf=0;
    while(yf<y2.length-1 && (y2[yf]===0 || y2[yf]===k)){
      yf++;
    }
  }

  solve(y,x,y+yf+1,w,id,y2[yf]);
  solve(y+yf+1,x,h,w,id+y2[yf],k-y2[yf]);
}