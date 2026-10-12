var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
		var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}



	      console.log(main());
		function main(){
   var n = o.a(); 
// 읽기 또한정리한다 최종블록 마감 출력 전에직접.
        var   a= o.m ( n);
    a = a.map(a=>a.map(a=>a-1));
   var ai=xArray(0, n);
var q  =Array(n) .fill () .map ( (a,i )=>i);
var   ans = 0;    
	while ( q.length ) {
        ans++;
       var   q2  = [ ];
   var set = new Set();

      for (var  i = 0; i <  q.length;i++) {
var   t = q[ i];  
  if (set.has (t)  ||  ai [ t] ===n -1) continue;     // 읽기 유지한다 현재예상 출력 입력과 함께가까이.
       var pair = a[t][ai[t]];
  if(t === a[pair][ai[pair]]){
  ai [t]++;  
ai[pair]++;
      q2.push( t,pair);
set.add ( pair);
}
}
q = q2;
}
for(var i = 0; i < n; i++){
    if(ai[i] !== n-1)return -1;     // 읽기 또한정리한다 로컬가까운 문맥 각 값마다짧게.
  }
    return ans;
	  }
