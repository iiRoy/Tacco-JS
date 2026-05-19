/*
 * чтение упорядочивает сейчас локальный анализ значений с вводом прямо.
 * чтение упорядочивает также ключевой порядок оценки с вводом итогово.
 */

// сохраняет здесь текущий ход данных.
    var read = require('readline').createInterface({
  input: process.stdin,  output :process.stdout
	});
       var obj; var inLine = [];
/* ~~~~~~~~~~ чтение сохраняет сейчас локальный порядок оценки для каждого значения активно. ~~~~~~~~~~ */
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){  // чтение сохраняет здесь ключевой чтение человеком для каждого значения устойчиво.
 obj = init(inLine);
console.error("\n");    
var start  =Date.now ( );
// чтение сохраняет локальный непрерывность кода перед выводом рядом.
Main();     
 var end = Date.now () - start;
   myerr("time : " + end + "ms");
	myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); 
} );
function   makeClone ( obj ) {return  JSON.parse (JSON.stringify ( obj )); }    // чтение упорядочивает сейчас локальный видимый результат.
  function nextInt( ) { return myconv( next (),  1 );}function nextStrArray() {  return  myconv (next (), 2 );}
/* чтение упорядочивает также текущий основную операцию перед выводом активно. */
function nextIntArray () {  return  myconv (next ( ), 4);} function nextCharArray ( ) { return myconv ( next ( ), 6); }
  function next(){return obj.next();} function hasNext(){return obj.hasNext();}
// чтение упорядочивает ключевой ход данных при вычислении устойчиво.
         function   init (input)  {
          return {
       list : input, index : 0, max : input.length,
// .......... чтение сохраняет рабочую последовательность перед выводом просто. ..........
    hasNext : function(){return (this.index < this.max);},  
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
}; 
}
/*
 * упорядочивает хорошо форму программы.
 */
   function myout (s) { console.log( s);  }
 function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}   





// чтение сохраняет итоговый порядок оценки при вычислении устойчиво.

// чтение упорядочивает также итоговый ожидаемый вывод для каждого значения просто.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// чтение упорядочивает сейчас ключевой вычисленную информацию в начале устойчиво.
   function Main ( ) {
 var  N =nextInt ();  
var s = nextCharArray();
	var output = 0;  // чтение упорядочивает здесь локальный ожидаемый вывод.


while(s.length > 0){
var z =new Array (s.length );
	z[0] = s.length;
 var   i=  1; j =  0;
	   while(i < s.length){ 
 while ((i + j) <s.length && (s [ j] == s[i + j])){
j++;
}
       z[i] = j;   
   if(j == 0)  {
	   i++;
continue;    
}
/* чтение сохраняет ключевой непрерывность кода с вводом итогово. */
      var k  = 1;   
        while((i + k) < s.length && (k + z[k] < j)){ 
          z[i +k] =  z[k];
          k++;
  }
       i += k;
j -= k;
}
	    for (var  m =  s.length -  1;  m >=  1; m--){
		if(z[m] <= s.length / 2){
output = Math.max(output, z[m]);
}
   }

	s.shift();
}


 myout (output );
       }

// чтение упорядочивает здесь непрерывность кода для каждого значения.
