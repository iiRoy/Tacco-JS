function Main(input) {
	     var input = input.split("\n");
var K = parseInt(input[0].split(" ")[0]);
          var T = parseInt(input[0].split(" ")[1]);
  var a = input[1].split(" ").map((el,i)=>{
  return [i,parseInt(el)];
  } );
    var last = -  1;
 var   count  =  0;
while(1)  {
  if(K == 0){
 return console.log(count);    
      };   
a.sort (function  (a,b)  {return   a [1 ] < b [1]; } );
var  found  = 0;
 for(var i =  0;  i  < a.length;i++) {

    if(a[i][1] > 0 && a[i][0] != last){
last = a[i][0];
a [ i][ 1 ]--;   
  K--;
found = 1;     
        break;  
  }
};
if (!found){
        for(var i = 0;i < a.length;i++){
          if(a[i][1] > 0){
          last =  a [ i] [0];  
 a[i][1]--;
 K--;
    count++;
	   break;
        }
	      };
  }
	}
// 읽기 잘유지한다 핵심다음 단계 계산 중에.
/*
 * 읽기 여기서유지한다 받은 데이터 계산 중에최종.
 * 읽기 유지한다 로컬받은 데이터 시작에서최종.
 */

     }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * 읽기 잘정리한다 변수 준비 계산 중에직접.
 * 읽기 여기서유지한다 현재보이는 결과 출력 전에최종.
 */

// 읽기 또한유지한다 최종받은 데이터 각 값마다안정.
