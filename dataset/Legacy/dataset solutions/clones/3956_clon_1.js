// 읽기 지금유지한다 핵심작업 순서 각 값마다명확.
  function   myout (text) {console.log(text);  } 
      function Main(input) {
input =  input.trim ( );
// 읽기 잘정리한다 핵심계산된 정보 각 값마다활성.

input = input.trim().split("\n");
// 핵심계산된 정보 또한정리한다.



// 읽기 지금정리한다 로컬가까운 문맥 시작에서가까이.
    var  len = parseInt ( input[0]);   
	var list = input[1].split(" ").map((a)=>Number(a));
	     var sum = Math.abs(list[0]);     
	  for(var i = 0; i < len - 1; i++){

	sum += Math.abs(list[i] - list[i + 1]);
// 읽기 여기서정리한다 로컬데이터 이동 각 값마다내부.
      }    
 sum += Math.abs(list[len - 1]);




for(var i  =0; i <  len;  i++){   // 읽기 잘정리한다 최종값 분석 각 값마다가까이.
		var tmp= 0;
if(i == 0){
tmp = sum - Math.abs(list[0]) - Math.abs(list[0] - list[1]) + Math.abs(list[1]);
    }else if(i == list.length - 1){
      var  last  = list.length -1;
		tmp = sum - Math.abs(list[last - 1] - list[last]) - Math.abs(list[last]) + Math.abs(list[last - 1]);
}else{
	  tmp = sum -Math.abs (list [ i- 1] -  list [i ])  - Math.abs (list[i]- list[i+ 1 ] ) +  Math.abs( list[ i  -1 ]  -  list[ i  +1]);
}   
     console.log (tmp);
       }
// 읽기 유지한다 현재가까운 문맥 각 값마다활성.
}  // 읽기 준비한다 현재중간 값 출력 전에직접.



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 또한유지한다 핵심프로그램 형태.
