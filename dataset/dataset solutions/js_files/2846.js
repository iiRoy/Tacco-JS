var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var a = o.l();
  a.sort((a,b)=>a-b);
  var ans = [-a[0]];
  for(var i = 1; i < n; i++){
    ans[0] += Math.abs(a[i]);
  }
  var s = a[0];
  for(var l = 1; l < n-1; l++){
    if(a[l] < 0)continue;
    var x = ans.length;
    if(x===1){
      ans.push(a[0]+" "+a[l]);
      s = a[0]-a[l];
    }else{
      ans.push(s+" "+a[l]);
      s -= a[l];
    }
  }
  ans.push(a[n-1]+" "+s);
  s = a[n-1]-s;
  for(var l = 1; ans.length !== n; l++){
    var x = ans.length;
    ans.push(s+" "+a[l]);
    s -= a[l];
  }
  return ans.join("\n")
}