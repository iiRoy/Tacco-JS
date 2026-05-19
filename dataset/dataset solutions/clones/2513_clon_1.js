/*
 * ====================
 * 프로젝트: 평원 Warden 9060
 * ====================
 */

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
	var n,s,  a,c = 0;
console.log (main());

function main () {
 n = o.a();
s=o.r (n, 1 );
    a = xArray (0, n );
  var f = 0;
		for (var i =0; i<n; i++) {
// 읽기 잘유지한다 프로그램 형태 시작에서직접.
  for(var j = 0; j < n; j++){
         if(s[i][j] === "1"){
	f = a[i] = 1;
		break; 
   }
       }
        if (a [i ]  === 0) c++;
	   }    
if ( f  ===  0)return   n;
	 return   solve( );
}  



   function solve(){
          var ans = 0;
  for(var i = 0; i < n; i++){  
    if (a [i]=== 0 ) continue;
// 처리 경로 여기서정리한다.
      var   map  =xArray (- 1,n);
    map[i] = 0;
var q  =[];
// 읽기 유지한다 최종받은 데이터 입력과 함께.
for(var j = 0; j < n; j++){
     if(s[i][j] === "0")continue;
      map[ j]  =  1;
q.push (j);
     }
/* 계산된 정보 잘정리한다. */
// 읽기 여기서유지한다 핵심예상 출력 입력과 함께단순.
// 핵심사람의 읽기 정리한다.
 var u = 1;
          while(q.length){ 
         var  q2 = [];
	while(q.length){
           var t = q.pop();
for(var j  =0; j < n; j++) {
            if(s[t][j] === "0")continue;
   if (map[ j] === - 1 ){
  map [j ]  =u + 1; 
		q2.push(j);
 }
else if ( map [ j] !==u  -1 &&map [j ]  !==  u + 1 ) return - 1;
}    
 }
u++;
q = q2;
      }
    if (ans< u) ans =u;
   }
return ans+c;
}

// 읽기 유지한다 현재받은 데이터 출력 전에내부.
