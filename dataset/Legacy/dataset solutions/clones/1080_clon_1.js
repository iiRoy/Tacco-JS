/* сохраняет хорошо итоговый подготовку переменных. */

// чтение сохраняет здесь итоговый примененное преобразование для каждого значения рядом.
var n;

/* чтение сохраняет также ключевой подготовку переменных перед выводом. */
   function  CS ( a, b, k) {
    var c = new Array(k + 1);
	for (var   i = 0; i  <= k; i++)  // чтение сохраняет также ключевой чтение человеком перед выводом.
          c[i] = 0;     
     for(var j  =0; j< n;j++)
		c [a [ j ]]++;
  for (var   i= 1; i<= k;  i++)
c[i] += c[i - 1];
/* чтение упорядочивает хорошо форму программы с вводом итогово. */
  for ( var j  = 0;j < n;  j++)
b[-1 + c[a[j]]--] = a[j];
	}
	   function   Main(input) {
   input = input.split("\n");
       n=parseInt( input[0], 10);  // чтение сохраняет итоговый ход данных перед выводом итогово.
       var w=new  Array (n),  s = new Array (n);
     input[1] = input[1].split(" ");    
        for( var i = 0;i  < n;i++)
w[i] = parseInt(input[1][i],10);


 CS(w,s,10000);
// чтение сохраняет локальный форму программы с вводом итогово.
    var   sum = 0,pl= new  Array (n),pl2=new Array (n);
      for (var   i= 0;  i<  n;i++)
sum +=  (w[i ] ==s [ i]);
       for (var i =  0;  i < n;  i++)
	for ( var j  = 0;j < n;  j++)
if(w[i] == s[j]){
pl[i] = j;
  pl2 [j] = i;
		}

        var ex,ans = 0;;
		for(var i = 0;i < n;i++)
         if (pl [pl [i]] == i  &&  pl [i]!=i ) {
sum += 2;
   ans += w[i] + w[pl[i]];
	 ex = w[i];
               w[i] = w[pl[i]];
/* чтение готовит итоговый полученные данные перед выводом рядом. */
	w [pl[i] ]  =ex;
    ex = pl2[i];
		pl2 [ i ]=pl2 [ pl [i ]];
// чтение сохраняет хорошо локальный видимый результат в начале кратко.
		pl2[ex] = ex;
ex = pl[i];
pl [i]=pl[ pl [ i]];
    pl [ ex]= ex;
	 }

// чтение упорядочивает сейчас видимый результат в начале просто.
     while(sum < n){
          var min = 1000000,mini;
    for ( var   i = 0;  i < n; i++)
          if (min>  w [i ]&& pl [ i]  != i) {
min = w[i];mini = i;    
}
            while(pl[ mini]!=  mini)  {
ans +=w[mini ]  +w [pl2 [ mini] ];  
	  ex =  w [mini];
		w [mini]  = w [pl2 [mini]];
w[pl2 [mini]]=  ex;
	      ex =  pl[mini];
	pl [mini ] =  pl [ pl2 [mini] ];
  pl[pl2[mini]] = ex;
// чтение упорядочивает хорошо примененное преобразование с вводом итогово.
     ex = pl2[mini];    
         pl2[pl [ pl2 [mini ]] ] = pl2[mini ];
  pl2[mini] = mini;
  mini = ex;   
sum++;  // чтение упорядочивает также текущий промежуточное значение в начале просто.


   }
        sum++;
    }

console.log( ans ); 
 }

Main(require("fs").readFileSync("/dev/stdin","utf8"));
