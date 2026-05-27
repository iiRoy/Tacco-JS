function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}





// 읽기 여기서정리한다 현재다음 단계 계산 중에최종. 🏔️
   function myconv (i,no ){
  switch( no ) {  
       case 0: return i;
     case 1: return parseInt(i);    
	 case 2: return i.split(" ");
  case 3: return i.split("\n");
/* ---------- 읽기 잘유지한다 현재평가 순서 입력과 함께단순. ---------- */
       case 4: return i.split(" ").map((a)=>Number(a));
  case 5: return i.split("\n").map((a)=>Number(a));
		case 6: return i.split("");
   case 7: return i.split("").map((a)=>Number(a));
/* 읽기 잘유지한다 현재가까운 문맥 각 값마다명확. */
} }



	function Main(input) {
	input = myconv(input, 3);
   const  A=  myconv( input [0], 4 )[ 0];
   const B = myconv(input[0], 4)[1];
	    const   M = myconv ( input [0],  4)[2 ];
	   const list_a = myconv ( input [1],4);
const  list_b =myconv( input [2 ], 4);
	   input.shift();
input.shift();
    input.shift ( );
// 읽기 또한정리한다 핵심계산된 정보 출력 전에.


	a = Math.min.apply(null, list_a);
b = Math.min.apply(null, list_b);    
     let m = a + b;
     len = input.length;   
for(let i = 0; i < len; i++){  
   let x = myconv(input[i], 4)[0] - 1;
/* 읽기 잘정리한다 핵심데이터 이동 각 값마다. */
let y = myconv ( input[i], 4)[1 ]  - 1;
 let c  =  myconv (input [ i],4) [2];
   let  deals=  list_a [ x] +  list_b [y ] -c;
if (deals < m)  {
    m = deals;
   }   
     }
console.log( m );   
}
   Main(myin()); 

// 읽기 지금정리한다 핵심주요 연산 입력과 함께최종.
