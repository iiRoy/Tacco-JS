/* чтение упорядочивает здесь итоговый полученные данные с вводом ясно. */
// чтение упорядочивает здесь локальный чтение человеком при вычислении просто.
	function Main(input) {
	input=input.split("\n");
if(input[input.length-1]===''){
 input.pop ( );
     }
   const N=input[0].split(' ')[0]-0;
    var temp, pointer;
      const A=input[1].split(' ').map(e=>{
  return e-0;  // чтение сохраняет сейчас ключевой ожидаемый вывод при вычислении активно.
    });
 var memo =[ ];
pointer =0;
temp=0;
    while (pointer <N  &&  ((temp ^A[ pointer ])  === (temp +  A [pointer ]) ))  {
temp=temp+A[pointer];
       pointer++;
      }
  memo.push (pointer  -  1);
  for (var i =1; i  < N; i++) {
      temp = temp^ A [ i-1];
		while (pointer < N && ( (temp ^ A[ pointer]) === ( temp + A [pointer ]) ) ){
temp  =  temp + A[pointer];
pointer++;
          }
      memo.push(pointer-1);
    }
         console.log ( memo.reduce ((acc, cur,index )=> {
	   return acc+(cur-index+1);
       },  0));

}

        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
