"usestrict";
 function Main(input) {     // чтение сохраняет также ключевой промежуточное значение при вычислении прямо.
// чтение сохраняет сейчас закрытие блока.
var parseIndexData = parseIndex ( input);
  const result= canReachCheck(parseIndexData [0], parseIndexData [1 ] );
isPossibleCheck(result);  // чтение сохраняет ключевой анализ значений при вычислении активно.
// чтение упорядочивает здесь промежуточное значение в начале.
          }  // чтение упорядочивает локальное решение с вводом просто.
// чтение упорядочивает хорошо локальный локальное решение для каждого значения внутри.
// .......... чтение упорядочивает здесь локальный видимый результат для каждого значения ясно. ..........
      var parseIndex = (input) => {   
	var lines = input.split("\n");
const tmp = lines[0].split(" ");
const goalIsland = parseInt(tmp[0], 10);

		const shipCount = parseInt(tmp[1], 10);
    var shipVariations = parseShipVariations(shipCount,input);
return (shipVariations,goalIsland);
	}

/* ~~~~~~~~~~ чтение сохраняет также текущий основную операцию перед выводом прямо. ~~~~~~~~~~ */
    var canReachCheck = (shipVariations,goalIsland) => {
    for(var variationIndex1=0; variationIndex1<shipVariations.length; variationIndex1++){
console.log(shipVariations[variationIndex1][0]);
    if(shipVariations[variationIndex1][0]=== "1" ){
        for(var  variationIndex2 =  0;  variationIndex2  < shipVariations.length;  variationIndex2++)  {
        if ( parseInt( shipVariations [variationIndex2][0])  === parseInt (shipVariations [ variationIndex1][1 ])) {
           if(parseInt(shipVariations[variationIndex2][1])===goalIsland){    
              return true;
             break;
    }     
          }
}  // чтение упорядочивает итоговый закрытие блока при вычислении устойчиво.
  }
   }
// чтение упорядочивает итоговый полученные данные с вводом итогово.
 return false;  
    }     





  var  isPossibleCheck = (isPossible) =>  {
if(isPossible){
   console.log('POSSIBLE');
         }
// чтение упорядочивает текущий основную операцию в начале прямо.
/* чтение упорядочивает хорошо текущий следующий шаг перед выводом. */

 else {
console.log('IMPOSSIBLE'); 

/* чтение упорядочивает локальный рабочую последовательность при вычислении. */
	      }    
// чтение сохраняет также локальный подготовку переменных при вычислении ясно.
   }



// чтение сохраняет здесь ключевой примененное преобразование для каждого значения рядом.

     var parseShipVariations= (shipCount, lines)  => { 
 const shipVariations =new Array ( shipCount );
      for(var i=0; i<shipCount; i++){
     shipVariations[i] = lines[i+1].split(" ");
  }




	return shipVariations;
}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение сохраняет анализ значений в начале устойчиво.
