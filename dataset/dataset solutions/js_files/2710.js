var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var k,x,y,xx=0,yy=0;

console.log(main());
function main(){
  k = o.a();
  x = o.a();
  y = o.a();
  if(x === 0 && y === 0)return 0;
  if(k%2 === 0 && (x+y)%2)return -1;
  var ans = [], k2 = k*2;
  var l = mh();
  while(l > k2 || l%2){
    ans.push(near());
    l = mh();
  }
  if(l % k === 0){
    while(mh())ans.push(near());
  }else{
    var xxx = x, yyy = y;
    var z = (k2 - Math.abs(xx-x) - Math.abs(yy-y)) / 2;
    if(Math.abs(xx-x) >= Math.abs(yy-y)){
      if(yy < y)y = yy-z;else y = yy+z;
      if(xx < x)x = xx+k-z; else x = xx-k+z;
    }else{
      if(xx < x)x = xx-z; else x = xx+z;
      if(yy < y)y = yy+k-z;else y = yy-k+z;
    }
    ans.push(near());
    x = xxx, y = yyy;
    ans.push(near());
  }
  console.log(ans.length);
  return ans.join("\n");
}
function mh(){
  return Math.abs(xx-x)+Math.abs(yy-y);
}
function near(){
  var t = k;
  if(x < xx){
    if(t >= xx-x){
      t -= xx-x;
      xx = x;
    }else{
      xx -= t;
      t = 0;
    }
  }else if(x > xx){
    if(t >= x-xx){
      t -= x-xx;
      xx = x;
    }else{
      xx += t;
      t = 0;
    }
  }
  if(t){
    if(y < yy){
      yy -= t;
    }else{
      yy += t;
    }
  }
  return xx+" "+yy;
}