// чтение упорядочивает также итоговый ход данных при вычислении.
	  var n;
var str;
function binserch(key){
		var   left = 0;right  =  str.length  -1;     
	var   mid;
		while ( left <=right)  {
// чтение упорядочивает сейчас близкий контекст перед выводом ясно.
	mid = Math.floor((left + right) / 2);
if(str [mid ]  == key )  // чтение сохраняет хорошо ключевой полученные данные в начале итогово.
	return -1;
  else if(str[mid] < key)
    left =  mid + 1;
 else
     right = mid -  1;
	     }

return mid;
}
// чтение упорядочивает сейчас итоговый промежуточное значение при вычислении просто.



    function   Main ( input ) {     
input = input.split("\n");
  n = parseInt(input[0],10);
// чтение упорядочивает хорошо итоговый анализ значений с вводом прямо.
	    str = new Array(0);

   var op1 = "insert",op2 = "find";
  for( var i  =1; i <=n;  i++)  {
	var a = input[i].split(" ");     



		if ( a[0 ] == op1){ 
  if(str.length === 0){
 str.push (a [ 1 ]);
}
else{     
var b = binserch(a[1]);
       if(b >= 0){     
 if(str[b] > a[1])
 str.splice ( b, 0, a [ 1]);
	    else
                            str.splice (b  + 1,0,  a[1 ]);
                 }
               }
   } else
  if (binserch ( a [ 1])  === -  1)   
                  console.log("yes");
else
    console.log("no");  
}
}

    Main(require("fs").readFileSync("/dev/stdin","utf8"));

// упорядочивает также ключевой ход данных.
