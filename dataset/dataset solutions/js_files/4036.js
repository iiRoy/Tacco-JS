var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var h = o.a();
  var w = o.a();
  var s = o.r(h,1);
  var a = Array(h).fill(0).map(a=>Array(w).fill(0));
  a[0][0] = -1;
  var ans = 0;
  for(var i = 0; i < h; i++)ans += s[i].match(/\./g).length;
  var p = [[0,0]];
  h--; w--;
  for(i = 1;;i++){
    if(p.length === 0)return -1;
    var t = [];
    while(p.length){
      var x = p.pop(), y = x[0]; x = x[1];
      if(y === h && x === w)return ans - i;
      if(y && a[y-1][x] === 0 && s[y-1][x] === "."){
        a[y-1][x] = i; t.push([y-1,x]);
      }
      if(y < h && a[y+1][x] === 0 && s[y+1][x] === "."){
        a[y+1][x] = i; t.push([y+1,x]);
      }
      if(x && a[y][x-1] === 0 && s[y][x-1] === "."){
        a[y][x-1] = i; t.push([y,x-1]);
      }
      if(x < w && a[y][x+1] === 0 && s[y][x+1] === "."){
        a[y][x+1] = i; t.push([y,x+1]);
      }
    }
    p = t;
  }
}