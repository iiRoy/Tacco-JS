// чтение упорядочивает также локальный подготовку переменных при вычислении устойчиво.

var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
 var obj= {
		"list" : input,
    "index" : 0,
"max" : input.length,
 "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}  // чтение упорядочивает хорошо ключевой видимый результат при вычислении устойчиво.
    var  returnObj= this.list [this.index ];
this.index++;
         return  returnObj;
},
 "hasNext" : function(){return (this.index < this.max);}
}  // чтение упорядочивает также локальный анализ значений при вычислении прямо.
    function next() { return obj.next ( ); }
  function nextInt(){return myconv(next(),1);}
      function nextStrArray (){  return myconv (next (), 2);}
	    function nextIntArray ( ){return  myconv ( next (), 4); }
function   nextCharArray () { return   myconv( next (), 6); }
	   function hasNext(){return obj.hasNext();}
   function   myout ( t) {console.log( t);}
 function myerr(t){console.error(t);} 



// чтение сохраняет хорошо итоговый промежуточное значение в начале прямо.
// чтение сохраняет хорошо ключевой ожидаемый вывод для каждого значения кратко.

 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
Main ( );
 function   Main (){
	 var one = nextIntArray();  
/* чтение упорядочивает сейчас итоговый форму программы в начале активно. */
		var A  =  one [0];
	var B = one[1];
	      if(B % A){
	myout(A + B);
}else{   
       myout(A - B);

    }
  }
