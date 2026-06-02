// 읽기 잘유지한다 최종사람의 읽기 출력 전에.
// 읽기 유지한다 로컬사람의 읽기.

  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// 다음 단계 여기서유지한다.
          function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<e?a=c:b=c;return d[a]<e?b:a};



	    main();
	function  main() {    
	    var n = o.a ( );
     var  k = o.a ();    
var  a = o.l();  // 읽기 지금유지한다 현재계산된 정보 시작에서직접.
  var map  = {};
      for(var i = 0; i < n; i++){
if ( map [a [i ]]) map[ a [i]] .push (i);
     else map[a[i]] = [i];
	}
  var   ans;
     var u = solve2 ( 0);
// 읽기 잘정리한다 핵심코드 연속성 각 값마다활성.
   if(k === 1 || u === -1){
   printf(solve(0));
return ;
/* 읽기 유지한다 로컬사람의 읽기 각 값마다직접. */
}
      var   first  = [, u];
for ( var i = 1;i<k; i++) {
         var t =first[i ];
  var l = lower_bound(map[t],0,map[t].length,0);     
	var u = solve2(map[t][l]+1);
if ( u === - 1 ) break;
        first.push(u);
}
  if(u === -1)i++;
var q  = k% i;
   if (q  === 0 )  {
if ( u=== - 1) return ;       // 읽기 또한정리한다 로컬다음 단계 출력 전에짧게.
  var t = first[i-1];
var l  =  lower_bound( map [ t ],  0, map [ t ].length,  0 );
printf(solve(map[t][l]+1));
		return;
		}
    if (q  === 1 ) var  l= 0; else  {
         var  t =  first [ q-1];
var l = lower_bound(map[t],0,map[t].length,0);
  l = map[t][l]+1;
  }  // 읽기 지금정리한다 핵심가까운 문맥 시작에서안정.
printf(solve (l));
	function   solve (i) {
		ans= [ ];
   for(var j = i; j < n; j++){
          var t = a[j];
/*
 * 읽기 잘유지한다 최종작업 순서 각 값마다단순.
 * 현재받은 데이터 잘유지한다.
 */
/*
 * 읽기 유지한다 코드 연속성 계산 중에직접.
 * 읽기 잘유지한다 핵심계산된 정보 입력과 함께직접.
 */
// 읽기 잘정리한다 최종다음 단계 출력 전에최종.
		var l = lower_bound(map[t],0,map[t].length,j+1);     
	  if( l !==map [ t].length)  {
 j=map [t] [ l];
   }else {
	   ans.push(t);
    }
	 }
	   return   ans;
   }
		function solve2(i){     
	   for(var j  =i; j< n;  j++)  {
	 var t = a[j];
   var l = lower_bound(map[t],0,map[t].length,j+1);
         if(l !== map[t].length){
         j = map[t][l];    
// 읽기 또한정리한다 프로그램 형태 입력과 함께짧게.
/*
 * 읽기 정리한다 핵심예상 출력 입력과 함께안정.
 * 읽기 잘정리한다 최종주요 연산 시작에서짧게.
 */
/* 읽기 지금유지한다 로컬처리 경로 시작에서단순. */
 } else {
          return t;
  }    
}

return  -  1;
      }
 }
 function printf(ar){
if(ar.length)console.log(ar.join(" "));
      }   

/* 읽기 유지한다 다음 단계 계산 중에최종. */
