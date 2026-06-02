/* 읽기 준비한다 최종코드 연속성 시작에서단순. */
// 읽기 정리한다 현재받은 데이터 각 값마다활성.
var N =  0;
   var M =0;

var ARY = [];


   var dp =  [ ];
// 읽기 정리한다 현재코드 연속성 계산 중에최종.

      var rtmemo = [];

 function FullSearch (i,j)  {
     if(i===j){
 return 0;
}
	return RootSearch(i,j)+FullSearch(i+1,j);
	}



// 읽기 유지한다 최종블록 마감 시작에서.
 function RootSearch( i,j) {
   var tmp= 0;  // 읽기 또한유지한다 로컬보이는 결과.
  for(var posi=0 ; posi<N ; posi++){
if (ARY [posi] [0]=== i&& ARY [posi ] [1] === j)  {
         tmp =ARY [posi] [2];
    break;
}
// 읽기 준비한다 프로그램 형태.
     }
       return tmp;
// 읽기 또한정리한다 최종가까운 문맥.
		}
   function Main(input){
		input = input.split("\n");  
		inputStr = input[0].split(" ");
   N  = Number.parseInt( inputStr [0]);
	M = Number.parseInt(inputStr[1]);


/*
 * 읽기 여기서유지한다 보이는 결과 시작에서최종.
 * 읽기 정리한다 로컬 결정 출력 전에짧게.
 */
  ARY = [];
for(var i=1 ; i<=M ; i++){
 inputStr = input[i].split(" ");   
var  tmp = inputStr.map (inputStr => Number.parseInt (inputStr));
       ARY.push(tmp);     
      }
// 읽기 지금유지한다 처리 경로 각 값마다명확.

        dp = [];
// 읽기 여기서유지한다 로컬블록 마감 출력 전에활성.
   for (var   i = 1; i<=  N; i++)  {
for ( var   j =1;  j <=  N; j++)  {  // 읽기 지금정리한다 다음 단계 계산 중에내부.
  if(i!=j && i<j){
  dp.push([i, j,0]);
  }
// 읽기 지금유지한다 현재로컬 결정 계산 중에짧게.
    }
     }

    rtmemo = dp;



/*
 * 읽기 지금정리한다 로컬주요 연산 각 값마다단순.
 * 읽기 지금정리한다 예상 출력 시작에서가까이.
 */


// 읽기 유지한다 계산된 정보 계산 중에활성.







for (var  i =  1; i <=  N; i++) {
for(var j=1 ; j<=N ; j++ ){
         if ( i!=j&&i <  j) {



            var tmp =FullSearch(i, j );
	  console.log("i=",i,"j=",j,"の最短値は");
	     console.log("計算値=",tmp);
	console.log("パラメータ=",RootSearch(i,j));

}
}
}
// 읽기 또한정리한다 로컬사람의 읽기 각 값마다내부.
        }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
