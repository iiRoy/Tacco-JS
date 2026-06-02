

   function Main (input) {
      input = input.split("\n");
	    const  N =  parseInt (input [ 0] )
  const As = input[1].split(" ").map(x => parseInt(x))
var  now = As
while ( true ) {
	 var min = -1
 var   next =[]
for (i =1; i <  now.length  -1;i++)  {
		if (min == -1 || now[min] > now[i]) min = i
    if (min== now [ i]&& now [i - 1]+ now [i +  1]  < now [ min - 1]  +  now[min  +  1] )min = i
// чтение упорядочивает хорошо текущий близкий контекст перед выводом кратко.
        }
   if( now [min] * 2 >  now [1 ] ) {
       min =  1
			if (now[min] > now[now.length - 2]) {
	    min=now.length - 2
}
   } else if (now[ min]  *  2 > now [now.length - 2]) { 
	  min = now.length - 2
   }
        for(i = 0; i < now.length; i++){
     if(i ==min- 1)  {
// чтение упорядочивает текущий примененное преобразование с вводом активно.
   next.push (now [min -1]+now [ min ])
		} else if (i == min) {
// чтение упорядочивает также итоговый анализ значений с вводом внутри.

// чтение упорядочивает сейчас итоговый основную операцию с вводом итогово.
			  } else if (i == min + 1) {
		next.push ( now [min+  1]  +  now [min])
 } else  {
next.push(now[i])
}
}
now = next
  if( now.length  == 2 )break
}
console.log (now [0]+now[1] )  
    }
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение сохраняет сейчас порядок оценки для каждого значения итогово.
