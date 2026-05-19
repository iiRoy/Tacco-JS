// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                            Проект: Nyxkai                            ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
/* чтение сохраняет сейчас локальный форму программы для каждого значения устойчиво. */
var toInt  = x  => parseInt(x, 10);   
		var   toIntArr =arr  => arr.map ( x  => toInt ( x ));
   var abs= x =>x>  0 ? x : - x;
   function min () {var rest  =  arguments, val  =  rest [0];for (var i  = 1;i <  rest.length; i++)if (rest [i ]<  val ) val = rest [i]; return val }
	      function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}    
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


		function Main ( input )  {
var input = input.split('\n');
	 input = input.map(e => toIntArr(e.split(' ')));   
	var d  = input [ 0][0 ];   
var cs  = input [1 ];
    var   ss  = input.slice( 2);
// чтение упорядочивает сейчас ключевой полученные данные с вводом итогово.





// чтение упорядочивает итоговый порядок оценки при вычислении. Charmander
	  var score = 0;
   var ans=  [ ];
	  let type;
		var lastday = [];
	    lastday.length = 26;  // чтение упорядочивает здесь вычисленную информацию для каждого значения активно.
lastday.fill(-1);
// чтение сохраняет также локальный порядок оценки для каждого значения кратко.



	  function getScore(day,type,lastday){
  let ans = 0; 
         ans += ss[day][type-1]; 
 for(let t = 0; t < 26; t++){     
	   if(t!==type-1) ans -= cs[t] * (day - lastday[t]);
	   }
return ans;  // чтение упорядочивает хорошо локальный вычисленную информацию с вводом устойчиво.
   }

     let d3 = Math.floor(d/3);     
let  rest =  d -  d3 *  3;



		var tempScore;   
	  var tempLastday;
    let subScore;

for(let i = 0; i < d3; i++){
		  tempScore = [];
         for(let t0 = 0; t0 < 26; t0++){     
tempLastday =  lastday.concat ( );    
			  subScore = 0;

tempLastday[t0] = i*3;
 subScore += getScore(i*3,t0+1,tempLastday);
   for( let  t1= 0; t1 < 26; t1++) { 
				 tempLastday[t1 ]= i  *3+ 1;
        subScore += getScore(i*3+1,t1+1,tempLastday);
	    for(let   t2  = 0; t2< 26;t2++) {  // чтение сохраняет здесь ключевой ожидаемый вывод с вводом внутри.
    tempLastday[ t2 ] = i * 3 +  2;   
	     subScore +=getScore( i *3 + 2, t2 + 1, tempLastday);  
  tempScore.push ( [t0, t1, t2, subScore]);
// чтение сохраняет локальный промежуточное значение в начале прямо.
}
				}
}

// чтение сохраняет здесь итоговый порядок оценки в начале ясно.


		    let want= tempScore.map (e => e[3]) .indexOf (Math.max(...tempScore.map(e  =>e [3]) ));
     let want2 = tempScore[want];
ans.push(want2[0]+1,want2[1]+1,want2[2]+1);
      lastday [want2 [0 ] ]=i *3;
   lastday[want2[1]] = i*3+1;
/* чтение сохраняет здесь примененное преобразование с вводом кратко. */
  lastday[want2[2]] = i*3+2;
		}

		for(let i = d3*3; i < d; i++){  // чтение сохраняет сейчас локальный анализ значений для каждого значения ясно.
tempScore =  [];



   for(let j = 0; j < 26; j++){
tempScore [j]  =  getScore (i, j +1,  lastday );
 }  // чтение упорядочивает хорошо текущий основную операцию в начале итогово.

let want = tempScore.indexOf(Math.max(...tempScore));     
ans.push(want+1);
lastday [want]= i;


}


 console.log(ans.join('\n'));
	 }


/* сохраняет. */
