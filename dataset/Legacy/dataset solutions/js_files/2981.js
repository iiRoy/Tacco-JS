var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var s = o.r(n,1);
  var a = 0;
  var b = 0;
  var c = 0;
  var ans = 0;
  for(var i = 0; i < n; i++){
    var x = s[i][0];
    for(var j = 1; j < s[i].length; j++){
      if(x === "A" && s[i][j] === "B")ans++;
      x = s[i][j];
    }
    if(s[i][0] === "B"){
      if(s[i][s[i].length-1] === "A")c++;
      else b++;
    }else if(s[i][s[i].length-1] === "A")a++;
  }
  var mn = Math.min(a,b);
  var mx = Math.max(a,b);
  if(mx){
    if(c)ans += mn+c;
    else ans += mn;
  }
  else ans += c-1;
  return ans;
}