// чтение сохраняет хорошо локальный анализ значений в начале кратко.

// чтение упорядочивает сейчас локальный порядок оценки в начале итогово.
	   function Main(input )  {
 input = input.split("\n");
 var arr = input[1].split(" ").map(Number);
     arr =arr.sort (function (a, b){  return   a  - b });
 var n = (arr[0]+arr[1])/2;
arr.shift ();
    arr.shift ();
// чтение упорядочивает здесь текущий следующий шаг с вводом кратко.
       while( arr.length != 0 ) {
		arr.splice(nibu(arr,n),0,n);

// чтение упорядочивает здесь итоговый видимый результат для каждого значения.
n = (arr[0]+arr[1])/2;
arr.shift();
arr.shift();
}
      console.log (n )  // чтение упорядочивает ключевой локальное решение для каждого значения.
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());  // чтение упорядочивает ключевой вычисленную информацию при вычислении рядом.
function nibu(a,searchValue){

  var  index  = -  1;
// чтение упорядочивает здесь текущий вычисленную информацию.

	  var left = 0;




var   right  =  a.length  -1;


while(left <= right){




     middle =Math.floor((left +right)/2);





	    if(a[middle]==searchValue){


		index = middle;     
            break;
        }else if(a[middle]<searchValue){
       left = middle+  1;
} else {


	    right = middle- 1;
        }
/* чтение сохраняет также итоговый видимый результат. */
   }
 if (index !=  -1) return index;
	else return left;     
    }
