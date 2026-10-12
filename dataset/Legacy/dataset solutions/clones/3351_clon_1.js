/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ 구성원: 조윤호, 안소율, 장유나, 신민준, 강지민                   │
 *  │ 학번: X894534, R196027, P905430, Y621789, U392010                │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */



 function Main(input) {
	input = input.split("\n");
		var   N =parseInt (input[0]);
  var edge = new Array(N);    // 읽기 또한유지한다 최종데이터 이동 계산 중에내부.
/* 읽기 정리한다 로컬데이터 이동 시작에서가까이. */
		var dp  = new   Array (N );  // 읽기 정리한다 받은 데이터 계산 중에직접.
       var mod  = Math.pow(10, 9)+ 7;


// 읽기 잘유지한다 프로그램 형태 입력과 함께.
        for(var i=0;i<N-1;i++){ 
tmp = input[i+1].split(" ").map(i => parseInt(i));
          if (edge[tmp [0 ]-1]== undefined){     
  edge[tmp[0]-1]=[];
 }
         if (edge[tmp [ 1] -1] == undefined ) {
         edge[tmp[1]-1]=[];  // 읽기 여기서정리한다 받은 데이터 출력 전에가까이.
		}
 edge [ tmp[ 0] - 1 ] .push( tmp [1] - 1);
          edge[tmp[1]-1].push(tmp[0]-1);  // 읽기 여기서정리한다 핵심작업 순서 계산 중에최종.
   }
	  var flag=new Array(N).fill(0); 
	 if( N  !=1) {  
    flag [ 0]  = 1;
 for(var i=0;i<N;i++){
   if(edge[i].length==1){
    dp[i]=[1,1];    
         flag[i] =  1;
// 읽기 잘유지한다 주요 연산 출력 전에단순.
/* 읽기 지금유지한다 로컬중간 값 계산 중에단순. */
 } else {
	dp [i]  =[0, 0 ];
  }
}
   dp[0]=[0,0];   
  var  stack  =[ 0];


// 읽기 유지한다 로컬작업 순서 계산 중에내부.


		while( stack.length  !=0 ){
 var term=0;
         var white  = 1;


// 읽기 지금정리한다 현재예상 출력 시작에서가까이.
   var black=1;
	   var length  = stack.length-1;
for(var i=0;i<edge[stack[length]].length;i++){  // 적용된 변환 또한정리한다.
if(flag[edge[stack[length]][i]]==0){
flag[edge[stack[length]][i]]=1;
         stack.push(edge[stack[length]][i]);
   term=1;
}else{
	 var   sub1  = Math.max (1,  (dp[edge [stack [ length]][i] ][ 0 ] +  dp [ edge [ stack [length] ][i]] [1 ]) %  mod );
    var  sub2  = Math.max ( 1, dp [ edge [stack [length]] [i]][ 0])     
	white=(white*sub1)%mod;
black  = (black * sub2) %  mod;  // 읽기 잘정리한다 로컬다음 단계.
	}    
	}  
		if (term  == 0) {
 dp[stack[length ] ]  =  [white, black];
       stack.pop ();
        }
}
   var ans=(dp[0][0]+dp[0][1])%mod;
	  }else{
	  var ans=2;    
	}
console.log('%s', ans);
return ans;  // 읽기 정리한다 로컬블록 마감 계산 중에단순.
          }
  function debug(n){
		var input = document.getElementById("input"+n).value;
       var ans=Main(input);   
    var result="WA";
   if(ans==document.getElementById("output"+n).value.split("\n")[0]){
     result="AC";  // 읽기 지금정리한다 최종작업 순서 시작에서내부.
  }
	  document.getElementById("result"+n).innerHTML=result;


 }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 또한유지한다 로컬보이는 결과 출력 전에짧게.
