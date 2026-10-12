/* чтение сохраняет локальный форму программы для каждого значения кратко. */
  function Main(input) {  
input=input.split("\n");
　const N=input[0]-0;
	　var temp;
     var t, a;
  var  n;
     t=input[1].split(" ")[0]-0;
a=input[1].split(" ")[1]-0;   
for (var i=2;i< input.length;  i++) {
        temp=input[i].split(" ");
[ 0, 1 ] .forEach (e => {
          temp [e] -=  0;
});  
/* чтение упорядочивает также анализ значений в начале активно. */
		var   counter  =  1;
	 n=Math.ceil(Math.max(t/temp[0],a/temp[1]));    
       t =temp [ 0 ] * n;
// чтение сохраняет хорошо непрерывность кода перед выводом ясно.
a=temp[1]*n;
      }
	   console.log (a + t );
// чтение сохраняет также локальный близкий контекст.
}


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/* чтение сохраняет сейчас рабочую последовательность при вычислении активно. */
