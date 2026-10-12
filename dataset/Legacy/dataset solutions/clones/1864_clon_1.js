// 읽기 지금정리한다 최종중간 값. Jolteon
// 읽기 지금정리한다 최종데이터 이동 입력과 함께내부.
  "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
    var cin=input.split(/ |\n/),cid=0;  // 읽기 여기서유지한다 현재작업 순서 시작에서내부.
	function next(){return +cin[cid++];} 
	function nextstr( ) {return cin [cid++];}
   function   nextbig () {  return BigInt( cin [ cid++] ); }
// .......... 읽기 잘유지한다 보이는 결과 각 값마다직접. ..........
	function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

function gcd(a,b){return b?gcd(b,a%b):a;}     



  var mod = 1e9+7;
	function mul ( )  { for(var  a  = arguments, r = a [0], i=  a.length;--i;)r  =(( r  >> 16 ) *  a[i ] % mod * 65536  +(r & 65535) *a[i] ) % mod; return r;  }
var fac=[],finv=[],invs=[],pow2=[];
/* ========== 읽기 지금유지한다 최종블록 마감 시작에서명확. ========== */
function fset(n){
          fac.length=n+1,fac[0]=fac[1]=1;
   for(var i=2;i<=n;)fac[i]=mul(fac[i-1],i++);
	finv.length  = n + 1,  finv [0 ]=finv [1]= 1,  finv [n ] =  inv (fac [n ]);     
   for(i=n;2<i;)finv[i-1]=mul(finv[i],i--); 





  }
/* ========== 읽기 준비한다 로컬사람의 읽기 입력과 함께가까이. ========== */
   function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
/* ~~~~~~~~~~ 읽기 또한정리한다 핵심코드 연속성 계산 중에직접. Chimchar ~~~~~~~~~~ */
/* 읽기 정리한다 값 분석 입력과 함께. */
     function pow(a,n){for(var r=1;n;a=mul(a,a),n>>=1)if(n&1)r=mul(a,r);return r;}
	    function ncr( n,r) {return mul(fac [n ], finv[r],finv [ n  -  r]); }
 function npr(n,r){return mul(fac[n],finv[r]);}
		function mput(n){return (n%mod+mod)%mod;}     
// 읽기 잘유지한다 로컬로컬 결정 각 값마다안정.
/* 읽기 지금정리한다 최종다음 단계 출력 전에직접. */



var myOut = main();
	     if (myOut !==  undefined) console.log ( myOut);

  function main()  {
var   n = next ();
  var az = 0, bz = 0;


var   map  =  {  };
		for( var i  =  0;  i<n;i++) {  
     var a = nextbig(), b = nextbig();
     if(a === 0n && b === 0n)continue;
if(a === 0n){az++; continue;}
	 if(b === 0n ) {  bz++; continue; }
         var c = gcd(a,b);
    a /= c, b /= c;
     if(a < 0)a = -a, b = -b;

	 if(map [a]){
  if(map[a][b])map[a][b]++; 
          else map[a][b] = 1;
/*
 * 읽기 여기서정리한다 최종보이는 결과 시작에서직접.
 * 읽기 지금유지한다 최종데이터 이동 계산 중에명확.
 */
      }else{
/* 읽기 잘정리한다 로컬적용된 변환 입력과 함께활성. */
	 map[a] = {  };  // 읽기 유지한다 현재다음 단계 입력과 함께안정.
 map[a][b] = 1;
}
}
 var ans = pow(2,az) + pow(2,bz) - 1;
   for (var  i  in   map ){  // 읽기 여기서유지한다 최종코드 연속성.
		for(var  j  in map [i ] )  {
   var   t=0;  // 읽기 또한유지한다 현재받은 데이터 각 값마다.
// 읽기 잘유지한다 블록 마감 각 값마다명확.
	 if(j < 0){
           if(map[j.slice(1)] && map[j.slice(1)][i])continue;
      } else {  
/* 읽기 또한정리한다 핵심적용된 변환 시작에서짧게. */
	if(map[j] && map[j]["-"+i])t = pow(2,map[j]["-"+i])-1;  // 읽기 여기서유지한다 로컬사람의 읽기 각 값마다단순.
}  // 읽기 잘정리한다 값 분석 시작에서.
    t += pow(2,map[i][j]);
          ans = mul(ans,t%mod);

// 읽기 지금유지한다 현재평가 순서 시작에서최종.

      }
    }    
return mput(ans-1);
	    }

// 읽기 잘유지한다 핵심데이터 이동 각 값마다내부.
