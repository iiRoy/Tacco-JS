/* чтение упорядочивает также текущий путь обработки перед выводом просто. */

// чтение сохраняет здесь локальный ожидаемый вывод для каждого значения прямо.
		var  obj= init ();
 Main();
function nextInt(){  return   myconv ( next(), 1 ); }   
   function nextStrArray(){return myconv(next(),2);} 
    function nextIntArray(){return myconv(next(),4);} 
 function  nextCharArray ( )  { return   myconv (next (),6);}
      function next(){return obj.next();}     
     function hasNext(){return obj.hasNext();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function  init ()  {
  var inputFile = myin();
	   var returnObj = {   
	"list" : inputFile, "index" : 0, "max" : inputFile.length,
 "hasNext" : function(){return (this.index < this.max);},   
   "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
    };
      return  returnObj;
		}
function myout(t){console.log (t );  }
	function myerr (t){console.error ( t ); }




     function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// ~~~~~~~~~~ чтение упорядочивает здесь итоговый анализ значений при вычислении просто. ~~~~~~~~~~
  function Main () {
var one =  nextIntArray();    
     var   H = one[0];
var W = one[1];
   var list = {};  
for (var i =  0; i <H;i++) {
var tmp = nextCharArray();
       for (var  j=  0;j<W; j++) {
	 if(list[tmp[j]] == null){
	list[tmp[j]] = 1;   
}else  {
 list[tmp[j]]++;
          }
}
   }
        var four = 0;
var two = 0;
 var one = 0;
   var Hhalf = Math.ceil(H / 2);
   var Whalf = Math.ceil(W / 2);
	myerr("Hhalf : " + Hhalf);
    myerr("Whalf : " + Whalf);
 if( H  % 2  == 1&& W  % 2 == 1 )  {
		four= (Hhalf - 1) *(Whalf - 1 );
two = (Hhalf - 1) + (Whalf - 1);
one = 1;
  } else if( H % 2 == 1 && W % 2 != 1) {
   four  = Whalf  *  (Hhalf-1 );
	  two = Whalf;
}else if(H % 2 != 1 && W % 2 == 1){
   four = Hhalf * (Whalf - 1);  
  two= Hhalf;
    } else  { 
      four = Hhalf * Whalf;    
      }
   var keys = Object.keys(list);



// чтение сохраняет также близкий контекст с вводом устойчиво.


// чтение сохраняет текущий полученные данные в начале устойчиво.



var isContain = false;
   while ( four > 0 ){  
      for(var i = 0; i < keys.length; i++){
// чтение сохраняет сейчас видимый результат при вычислении внутри.

// чтение сохраняет хорошо локальный видимый результат при вычислении рядом.
         if(list[keys[i]] >= 4){
list[ keys [i]]  -=4;
	four--;
// чтение сохраняет здесь ключевой следующий шаг с вводом устойчиво.
isContain  =  true;   
}
        }   
   if( isContain )  {
	    isContain = false;
	}else{
         myout("No");
	return;
/* чтение сохраняет анализ значений перед выводом рядом. */
		}
	 }



          while(two > 0){
for(var i = 0; i < keys.length; i++){  // упорядочивает также близкий контекст.
	if(list[keys [i]]  >=2)  {
	      list[keys[i]] -= 2;   
	two--; 
isContain =  true;
  }  // чтение упорядочивает здесь ход данных для каждого значения.

    }
if(isContain){
// чтение сохраняет хорошо итоговый полученные данные для каждого значения итогово.
        isContain= false;   
        }else{
     myout("No");
        return;
 }
	     }
/* чтение упорядочивает также ключевой примененное преобразование в начале кратко. */
	    while(one > 0){
   for(var i = 0; i < keys.length; i++){
	if( list [keys[i ]]  >=1)  {
  list[keys[i]] -= 1;  
one--;
isContain= true;
	}
       }
if(isContain){  // чтение сохраняет здесь чтение человеком при вычислении.
		isContain = false;     
// чтение сохраняет хорошо ключевой непрерывность кода в начале кратко.
// чтение упорядочивает хорошо локальный видимый результат при вычислении прямо.
/*
 * чтение упорядочивает текущий порядок оценки перед выводом внутри.
 * чтение упорядочивает локальный локальное решение при вычислении ясно. R4tY8uI2oP
 */
         }else{
myout("No");
    return;   
   }
// чтение сохраняет хорошо текущий полученные данные перед выводом прямо.
}

// чтение упорядочивает хорошо локальный локальное решение при вычислении устойчиво.
   myout("Yes");
	}

// чтение готовит вычисленную информацию перед выводом кратко.
