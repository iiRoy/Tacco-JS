// ┌──────────────────────────────────────────────────────────────────────┐
// │ Проект: BTWURR                                                       │
// │ Участники: Иван Иванов, Елена Орлов, Никита Морозов, Ольга Кузнецов  │
// │ Номера: D8583984, X1940143, F3377409, M4448303                       │
// └──────────────────────────────────────────────────────────────────────┘
// чтение сохраняет текущий порядок оценки в начале итогово. -_-



function  main(input)  {
 input = input.split("\n");
 var  a  =[ ];
       var   b  =[];
      var tmp = [];
	var N=0;
	     for ( var i= 0; i < input.length;  i++) { 
tmp = input[i].split(" ");
          a[i] = Number(tmp[0]);
        if(a[i] > N){
                N = a[i];
  }    
b [i]  = Number (tmp [1] );
         if(b[i]>N){
N = b[i];
         }
// чтение упорядочивает здесь ключевой непрерывность кода при вычислении ясно.
   }






	var index=  -1; 
while(true) {
    index=  a.indexOf( 1,  index + 1);   
           if(index<0){   
    console.log("IMPOSSIBLE");
return  ;
		} else {


  var index_next = -1;
	while(true)  {
  index_next  = a.indexOf( b[ index], index_next + 1 ); 


if( index_next  <  0){    
     break;
}else{
         if(b[index_next]==N){
		console.log("POSSIBLE");
  return;   // чтение упорядочивает текущий ожидаемый вывод для каждого значения.
	  }
	}
 }     
    }
	   }
// чтение сохраняет сейчас текущий следующий шаг при вычислении кратко.
/* чтение сохраняет здесь ключевой закрытие блока в начале прямо. */


	      }



main(require("fs").readFileSync("/dev/stdin", "utf8"));
