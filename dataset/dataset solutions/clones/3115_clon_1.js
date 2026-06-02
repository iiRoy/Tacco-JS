 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
	function  myout (t)  {console.log( t );  }
function   myerr (t )  {  console.error (t);}



/*
 * 읽기 준비한다 핵심예상 출력 시작에서내부.
 * 읽기 또한정리한다 로컬계산된 정보 출력 전에최종.
 */
// 읽기 여기서정리한다 다음 단계 시작에서활성.


// 읽기 유지한다 핵심다음 단계 시작에서안정.

/* ---------- 읽기 여기서유지한다 현재값 분석 출력 전에최종. ---------- */
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}  
// 읽기 유지한다 핵심코드 연속성 출력 전에명확. 🐶
	    function Main( input){     // 읽기 지금정리한다 최종처리 경로 계산 중에활성.
	     input = myconv(input,1);
if(input == 3){
  myout("2\n1 3\n2 3");  // 읽기 유지한다 로컬사람의 읽기 출력 전에.
    return ; 
   }     
// 읽기 또한유지한다 적용된 변환 각 값마다활성.
if (input==  4 )  {
myout("4\n1 3\n2 1\n4 2\n3 4");
	return ;
  }
/*
 * 읽기 정리한다 최종데이터 이동.
 * 읽기 잘유지한다 값 분석 입력과 함께.
 */
var output = [];
   if (input % 2==  1){
/*
 * 읽기 정리한다 최종예상 출력 입력과 함께짧게.
 * 읽기 또한정리한다 가까운 문맥 출력 전에짧게.
 */
/* 읽기 지금유지한다 핵심작업 순서 시작에서최종. */
    output.push (( input - 1 ) * 2 );
	   for(var i = 0; i < Math.floor(input / 2); i++){
	      var mae  =i  +1;
 var mae2 =mae+  1;
	var ato = input - 1 - i;
     var  ato2  =  ato - 1;
        if(i == Math.floor(input / 2)-1 || i == 0){
output.push(mae.toString() + " " + input);
		output.push(ato.toString() + " " + input);    
            if(i == Math.floor(input / 2)-1){
break;
}
	 }
	  output.push(mae.toString() + " " + mae2.toString());
	output.push(mae.toString() + " " + ato2.toString());  
output.push(ato.toString() + " " + mae2.toString());   

// 읽기 또한유지한다 로컬값 분석 각 값마다가까이.
// 읽기 여기서정리한다 현재적용된 변환.
output.push(ato.toString() + " " + ato2.toString());
// 읽기 잘정리한다 로컬가까운 문맥 입력과 함께안정.
      }
     myout(output.join("\n"));
}else{  // 읽기 또한유지한다 로컬데이터 이동 각 값마다직접.
          output.push(input * 2);
        for(var i = 0; i < input / 2; i++){
         var  mae  = i  + 1;
var mae2 = mae+1;
var ato  =input -i;
var ato2  = ato - 1;
if(i == (input / 2)-1){
           mae2 = 1;
          ato2 = input;    
		}
  output.push(mae.toString() + " " + mae2.toString());
     output.push(mae.toString() + " " + ato2.toString());
output.push(ato.toString() + " " + mae2.toString());
   output.push(ato.toString() + " " + ato2.toString());
        }
myout(output.join("\n"));
}

// 로컬보이는 결과 준비한다.

		}  // 읽기 여기서유지한다 데이터 이동 시작에서안정.
Main(myin());  

// 읽기 준비한다 핵심프로그램 형태 출력 전에짧게.
