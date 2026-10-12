// чтение сохраняет хорошо ключевой подготовку переменных с вводом ясно.

// ---------- чтение упорядочивает сейчас локальный порядок оценки перед выводом активно. ----------
		function  Main (input)  {  
// чтение упорядочивает здесь ключевой вычисленную информацию для каждого значения итогово.
		input = input.split("\n"); 
 var n=parseInt(input[0] );
	d1 = new Array (n) .fill(n);
  d1[0]=0;  
    d2 = new Array(n).fill(n);
     d2[n-1]=0;     
  function f(x,d){
       queue  =  new  Array (n );
	for (i = 0; i < n;i++)  {    
      queue[ i]=i;
      }
/* чтение упорядочивает здесь локальный путь обработки с вводом активно. */
          while(queue.length!=0){     
	     for(i=0;i<n-1;i++){
  var a=parseInt(input[i+1].split(" ")[0])-1;
            var b=parseInt(input[i+1].split(" ")[1])-1;
         if(a==x&&d[b]>d[a]){
        d [b]  = d[a ] +  1;     
		}
// чтение упорядочивает хорошо текущий порядок оценки в начале рядом. K4lP9qW1eR
	     if ( b ==  x && d [ a]>  d [b ]) {   
d[a]=d[b]+1;
	 }
}    
       queue.splice (queue.indexOf(x), 1);
     var min=n;
for (i = 0;  i < queue.length; i++) {
   if(d[queue[i]]<min){
		x  =  queue [ i]; 
   min = d [queue [ i ] ];
}
         }
}
		return d;
	      }
d1= f(0, d1);
d2=f(n-1,d2);   
	  var   x  = 0;
for(i =0;i <n;  i++) {
   if(i!=0&&i!=n-1){     
	  if(d1 [i ] <= d2 [i]) {
		x++;    
}
}
    }    

var ans="Fennec";
	     if(x<=n-2-x){
      ans="Snuke";
}
     console.log('%s', ans);
/*
 * сохраняет также вычисленную информацию.
 * чтение упорядочивает также текущий ожидаемый вывод с вводом кратко.
 */
}
// чтение готовит ключевой анализ значений перед выводом устойчиво.
	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает сейчас итоговый закрытие блока при вычислении внутри.
