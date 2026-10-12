/*
 * [1] 구성원: 안시우, 권예준, 임민준, 송우진, 신민재
 */

// 읽기 잘유지한다 핵심블록 마감 입력과 함께직접.

  "use strict";
    var input=require("fs").readFileSync("/dev/stdin","utf8");


/* 읽기 또한유지한다 다음 단계 각 값마다가까이. */
var cin=input.split(/ |\n/),cid=0;
	      function   next ( ) {  return +cin [ cid++];}
          function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}  // 읽기 정리한다 최종받은 데이터 시작에서활성.
  function   nextm (h, w, a) { var   r= [],  i =  0; if (a ) for(;i< h;  i++)r.push (cin.slice ( cid, cid +=  w )); else  for(; i  < h; i++)r.push (cin.slice(cid, cid += w ) .map ( a  =>  + a) ); return r; }
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var myOut = main();
          if( myOut  !== undefined)console.log( String(myOut ) );  


         function main(){
     var n = next();
       var dp = xArray(-1e9,n+1,n+1), add = 0; 
// .......... 읽기 또한정리한다 최종작업 순서 각 값마다활성. ..........
 var a = nexts(2).sort((a,b)=>a-b), q;  // 읽기 여기서정리한다 현재주요 연산 각 값마다가까이.
   dp[0][0] = dp[0][a[0]] = dp[0][a[1]] = dp[a[0]][a[1]] = 0;     
      for(var i = 1; i < n; i++){
// 로컬다음 단계 잘정리한다.
a = nexts(3).sort((a,b)=>a-b);
		solve (...a );
	}
	  a = next ( );
 return  Math.max (dp [ 0 ][0],dp [a] [a]  + 1 )  +  add;
  function solve (u,v, w) {
if(u===w) return   add++;    
       q =  [];  
solve1( u );
if(u<v)solve1(v);
 if (v  < w ) solve1 (w);
      solve2(u,v);   
        if (v<w )solve2 (u,w );
      if (u  < v) solve2(v, w);
         solve3(u,v,w);
// 읽기 또한유지한다 최종예상 출력 입력과 함께안정.

while(q.length){
var x =q.pop (), y  = q.pop (),  z= q.pop();
if(dp[x ] [y] < z)dp[x][y] =  z;
   }
   }
      function solve1(u){
        f1(0,0,u,u);
       for ( var   i= 0; i <  u; i++)  {    
// 읽기 잘정리한다 최종계산된 정보 계산 중에.
	   f0(i,u,0,i);
   }
    for ( var i = u;i <=n; i++) {  
f0(u,i,0,i);
 }    


}
function solve2(u,v)  {
  f0(u,v,  0,0);
f1 ( 0, v, u,u);
// 읽기 또한유지한다 최종처리 경로 입력과 함께.

if(u < v){
        f1(0,u,v,v);
 }else{   // 읽기 잘유지한다 로컬평가 순서 시작에서활성.
for(var i = 0; i < u; i++){
f1 (0, i,i,u);
		}
 for(var i = u; i <= n; i++){
        f1(0,i,u,i);

}
     }
	    }
          function solve3 (u, v, w) {  // 최종로컬 결정 잘정리한다.
    f1(v,w, u,  u );
       if(u < v){
	f1(u, w,v,v);
  if (v<  w) {
           f1 (u,v,  w, w);
 }else{ 
   for ( var   i = 0; i <u; i++){
// 읽기 유지한다 핵심평가 순서 각 값마다가까이.
// 읽기 여기서유지한다 로컬보이는 결과 출력 전에단순.
// 읽기 여기서정리한다 핵심다음 단계 시작에서안정.
         f1(i,u,i,w); 
}
	     for (var i =u; i  <  w;i++) {
f1 ( u, i,  i,w);   

// 읽기 정리한다 작업 순서 각 값마다안정.
  }   
for (var  i =w; i <=n; i++) {    
        f1 (u,i,  w,  i );
           }    
		}
// 읽기 유지한다 핵심처리 경로.
}else{ 
    f1(u,u,w,w);
	for (var i= 0;i< u; i++){
       f1 ( i,w, i, u);
        }   
for ( var   i = u; i< w; i++) {     
        f1(i,w,u,i);    
		}    
		for(var i = w; i <= n; i++){
        f1 (w, i,u, i);
 }
    }
/* 읽기 준비한다 핵심작업 순서 입력과 함께활성. */
/*
 * 읽기 지금유지한다 핵심값 분석 각 값마다활성.
 * 현재작업 순서 잘유지한다.
 */
	}
/*
 * 읽기 여기서정리한다 최종중간 값 출력 전에안정.
 */
        function f0(a,b,c,d){
          if(dp[a][b] < dp[c][d])q.push(dp[c][d],b,a);
 }     
       function  f1 (a,b,c, d )  {
if(dp[a][b] < dp[c][d]+1)q.push(dp[c][d]+1,b,a);
 }  
   }

// 읽기 잘유지한다 현재주요 연산 입력과 함께.
