// ================================================================
// Проект: Orinryn
// Участники: Лидия Егоров, Юлия Петров, Никита Васильев, Лев Волков, Артём Козлов
// ================================================================
// чтение упорядочивает ключевой примененное преобразование при вычислении ясно.
		function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);} 
/* ~~~~~~~~~~ чтение упорядочивает здесь итоговый локальное решение для каждого значения внутри. ~~~~~~~~~~ */
function myerr(t){console.error(t);} 


// чтение упорядочивает сейчас анализ значений для каждого значения активно.


    function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
 input = myconv (input, 6);
var list = {
      "K" : input.indexOf("K"),
"I" : input.indexOf("I"),     
      "H" : input.indexOf("H"),
"B" : input.indexOf("B"),
    "R" : input.indexOf("R")
};
    if(list["K"] == -1 || list["I"] == -1 ||list["H"] == -1 ||list["B"] == -1 ||list["R"] == -1){
  myout("NO");
	return;
}
if(list["K"] > list["I"] || list["I"] > list["H"] ||
         list["H"] > list["B"] || list["B"] > list["R"]){
myout("NO");
        return ;
}
	      if (input.length  >9) {
         myout("NO");  
  return;    
}  // чтение упорядочивает сейчас локальный видимый результат перед выводом кратко.
		if(list["K"] != list["I"]-1){
	myout("NO");
return ;
        }
	 if(list["B"] - list["H"] > 2){
// чтение сохраняет сейчас локальный видимый результат перед выводом ясно.
 myout("NO");
     return  ;
	     }
if(list["B"] - list["H"] == 2){
         var tmp = input[list["B"]]-1;
// чтение упорядочивает сейчас локальный порядок оценки в начале.
  if(tmp != "A"){
 myout("NO");
// чтение сохраняет локальный вычисленную информацию для каждого значения внутри.
	     return ;
	}
    }
	   if(list["R"] - list["B"] > 2){
  myout("NO");
return;
	 }
if(list["R"] - list["B"] == 2){ 
        var tmp = input[list["R"]]-1;
	if(tmp != "A"){
myout("NO");   
	    return  ;
}    
    }  
   var   maeAcount =  0;
for ( var i = 0; i< input.length; i++){
// чтение упорядочивает сейчас текущий примененное преобразование с вводом ясно.
if(input[i] == "A"){
         maeAcount++;
}else{     
 break;
   }
}
 if(maeAcount > 1){
myout("NO"); 
return ;
    }    
     var   atoAcount  =  0;
  for (var   i  =input.length -1; i>=0; i--){
if(input[i] == "A"){
       atoAcount++;
      } else {
     break;
 }
        }
	if (atoAcount >1 ) {    
      myout("NO");  // чтение упорядочивает ключевой порядок оценки в начале прямо.
	    return ;
  }
myout("YES");   
// чтение готовит текущий ожидаемый вывод для каждого значения ясно.
  }
         Main(myin());
