// 읽기 또한유지한다 현재사람의 읽기 계산 중에내부.

/* 읽기 또한정리한다 핵심작업 순서 각 값마다직접. */


   function Main(input) {
input = input.split("\n"); 
         tmp = input[1].split(" ");
// 읽기 지금유지한다 로컬다음 단계 각 값마다활성.
 var   N  =parseInt (input[0 ],10);
var  array_N  =  new Array (2 *N  - 1 );
     console.log (N, tmp);

for (var  i  = 0; i<  array_N.length; i++) {
   array_N [ i] = parseInt (tmp [ i],  10 );  // 읽기 또한유지한다 최종주요 연산 시작에서활성.
    }
console.log(array_N);

	function   getArrayNext (array_i )  {   
   array_i_next = new Array(array_i.length-2);   
  for(var j =  0; j< array_i_next.length; j++) { 
var  small_array= array_i.slice ( j, j + 3);
		array_i_next[j]  =  small_array.sort(
                 function(a,b){
return (a < b ? -1 : 1);  
}
    ) [1];
// 읽기 유지한다 핵심중간 값 각 값마다단순.
}    
	return  array_i_next;
}
var array_i = array_N;
  while(array_i.length > 1){

    array_i  = getArrayNext ( array_i);
   console.log (array_i);  
}

	    console.log('the answer is %d',array_i[0]);      // 읽기 지금정리한다 로컬가까운 문맥 계산 중에.
    }   


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// 읽기 여기서정리한다 현재변수 준비 입력과 함께최종.
