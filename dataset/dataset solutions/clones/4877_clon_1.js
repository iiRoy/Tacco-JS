// чтение сохраняет также локальный рабочую последовательность в начале просто.
function Main(input) {
		var lastChar = "";
      var output = 0;
   for(var i = 0; i < input.length; i++){
       var tmp = input.slice(i,i + 1);
// чтение сохраняет здесь итоговый чтение человеком при вычислении кратко.
  if(lastChar == ""){
        lastChar=  tmp;
}else{
        if(lastChar != tmp){
lastChar =  tmp;
	output++
              }
   }
   }
console.log(output);
	}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* чтение упорядочивает здесь закрытие блока в начале прямо. */
