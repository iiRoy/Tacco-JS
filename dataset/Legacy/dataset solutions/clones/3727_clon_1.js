// 읽기 잘유지한다 현재값 분석 계산 중에단순.
	   function Main(input){
	     input=input.split("\n");
   inp = input[0].split(" "); 
       inA = input[1].split(" ");

   N = inp[0];
   K = inp[1];    

answer = 0;
		index=  0; 

// 읽기 여기서유지한다 적용된 변환 입력과 함께짧게.
len = inA.length;
 a= 1;
          b = 1;
	c =  0;


for (i  =0;  i  < len;  i++)  {
// .......... 읽기 정리한다 현재값 분석 각 값마다직접. ..........
		if (inA[i] == "1") {
index = i;
break;
		}
       }

	a = index;   
   b =len- 1 -  index;
   if ( a+ b<=  K) {
	c=- 1;    

}
		for (; a > 0;) {
       answer=answer  +  1;
	a = a - (K - 1);  
		}
 for (;  b >  0; ){
answer = answer + 1;
     b = b - (K - 1);
}

if (answer != 0) {
	answer= answer +c;   
// 읽기 잘유지한다 로컬중간 값 계산 중에짧게.
	}
	 console.log (answer);
  }   
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
