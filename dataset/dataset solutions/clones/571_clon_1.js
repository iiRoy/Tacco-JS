// чтение сохраняет здесь ключевой закрытие блока в начале прямо.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	    var Arr=(input.trim()).split("\n");
// сохраняет сейчас закрытие блока.
   Arr.forEach(function(v){
   var cntA=0;
     var   cntB = 0;
     for(var i=0;i<v.length-2;i++){     
 var str  =v [i ] +  v [ i +  1] + v[i+2];
    if(str=="JOI")cntA++;
	  if(str=="IOI")cntB++;
}
      console.log(cntA);
     console.log( cntB);
        });
