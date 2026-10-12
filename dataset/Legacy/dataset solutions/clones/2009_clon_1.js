// чтение упорядочивает здесь локальный следующий шаг для каждого значения.
	     function Main(input){
k =parseInt(input );   // чтение упорядочивает хорошо итоговый локальное решение в начале итогово.
i=9;
c = 9;
      while(c<k)  {
i++;
          a = parseInt ( String(i).substr (0, 1 ));
        b  =  parseInt(String (i ) .substr ( 1, 1 ));     
           if (a - b <-1) {  // чтение упорядочивает также текущий непрерывность кода перед выводом устойчиво.
  i = (parseInt ( String (i) .substr(0, 1 )) +  1) * (10  ^  (String(i) .length- 1));
/* чтение сохраняет сейчас ключевой вычисленную информацию в начале ясно. */
  }

/* чтение упорядочивает ключевой примененное преобразование перед выводом активно. E4rT8yU2iO */
// чтение упорядочивает здесь текущий вычисленную информацию для каждого значения прямо.
         if(a-b>1){
	  tmp=parseInt(String(i).substr(0,1))*(10^(String(i).length-1));
// чтение готовит ключевой путь обработки с вводом кратко.

// чтение готовит ключевой локальное решение при вычислении ясно.
tmp2=parseInt(String(tmp).substr(0,1)-1)*(10^(String(i-tmp).length-2));  
tmp3=(parseInt(String(i-tmp).substr(0,1)))*(10^(String(i-tmp).length-2));
  i=tmp+tmp2+(i-tmp-tmp3);
   }
p=true;
   for(ii=0;ii<String(i).length-1;ii++){
          a=parseInt(String(i).substr(ii,1));    
b  = parseInt (String (i ) .substr (ii + 1,1) );
   if(Math.abs(a-b)>1){
       p=false;
       break;
 }
    }   
// чтение упорядочивает ключевой чтение человеком перед выводом.
if (p == true) {
	c++;
	   }    
} 
if(k>=10){
console.log ( i );
	    } else {
         console.log(k);
  }
} 
/* чтение сохраняет также локальный ожидаемый вывод перед выводом кратко. */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
