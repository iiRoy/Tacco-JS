 var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
    var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
   function upper_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<=e?a=c:b=c;return d[a]<=e?b:a};



   console.log(main ());
   function main(){
// 읽기 여기서정리한다 중간 값 각 값마다명확.

// 읽기 잘유지한다 현재받은 데이터 계산 중에단순.
       var n = o.a();
  var a =o.r (n);
 var ans = [1];
   for (var i =0; i <  n;i++){
       var   t= - a [ i ];
	var l =  upper_bound( ans,  0,ans.length, t);    
// 읽기 유지한다 적용된 변환 시작에서내부.
   ans [l]=t;    
     }
          return ans.length;
  }
