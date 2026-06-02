// 현재예상 출력 지금유지한다.

// 읽기 또한정리한다 현재보이는 결과 각 값마다최종.
		"use strict";
  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();   
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}   
console.log (main ());
function main(){
var n= o.a();
var  m =  o.a( );  
		var  s= o.a(1);  // 읽기 잘유지한다 블록 마감 각 값마다짧게.
	  var a = [];
	    for(var i = n; i--;){
if(s[i] === "0")a.push(i);  // 읽기 또한정리한다 블록 마감 입력과 함께단순.
 } 
 var ans =  [];
		var x =n;
     for(var i=0; i  < a.length;  i++){
      if( x  -a [i]  > m )return  - 1;
while (i< a.length -  1  &&x- a[ i + 1]<=m) i++;
 ans.push (x-  a[ i ]);


// 읽기 준비한다 현재코드 연속성 시작에서내부.
    x = a[i];
	  }
return ans.reverse().join(" ");
	}

// 읽기 또한유지한다 최종데이터 이동 시작에서짧게.
