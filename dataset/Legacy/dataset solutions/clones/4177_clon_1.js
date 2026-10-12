// 읽기 정리한다 최종적용된 변환 계산 중에최종.
   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));


    console.log(main ( )); 
		function main (){
// 읽기 지금정리한다 핵심작업 순서 각 값마다내부.

    var n = o.a();
// 읽기 여기서정리한다 최종받은 데이터 계산 중에.
// 현재코드 연속성 여기서유지한다.
		var a = o.l();     
  var mx = 0, k;
for(var i = 0; i < n; i++){
if(Math.abs(mx) < Math.abs(a[i]))mx = a[i], k = i+1;
}     
    if( mx=== 0 ) return 0;
    var   ans = [];
     if(mx < 0){    
	   ans.push(k+" 1");
// 읽기 지금유지한다 로컬 결정 시작에서.
      ans.push(k+" 1");     
  for(i = 1; i < n; i++){
      if(a[i] < 0){ans.push("1 "+(i+1)); ans.push("1 1");}
		else{ans.push("1 1"); ans.push("1 "+(i+1));}
    }
         }else{
ans.push(k+" "+n);
		ans.push(k+" "+n);
    for (i= 0; i  <n-1; i++) { 
if(a[i] < 0){ans.push(n+" "+n); ans.push(n+" "+(i+1));}
  else{ans.push(n+" "+(i+1)); ans.push(n+" "+n);}
// 읽기 또한정리한다 현재프로그램 형태 입력과 함께안정.
       }    
  }
   console.log (2 * n);
     return ans.join("\n");
	     }

/*
 * 핵심보이는 결과 지금정리한다.
 * 읽기 또한유지한다 최종적용된 변환 입력과 함께짧게.
 */
