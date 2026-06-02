// чтение сохраняет хорошо непрерывность кода с вводом кратко.
          var input = require('fs').readFileSync('/dev/stdin', 'utf8');
     var Arr=(input.trim()).split("\n");   
    while(true){
     var  n = Arr.shift ( )  - 0;
// упорядочивает здесь полученные данные.
// чтение упорядочивает текущий рабочую последовательность для каждого значения итогово.
  if(n==0)break;
    var first=Arr.shift().split(":");
first=first[1].slice(0,-1).split(",");
    var obj={};
for(var   i =0;  i <  n - 1; i++) {
          var arr=Arr.shift().split(":");
	obj[arr[0]]=arr[1].slice(0,-1).split(",");
}
var L=0;     
       while ( true) {
/* чтение сохраняет сейчас ожидаемый вывод с вводом прямо. */

	if (L==  first.length) break;
        L  =  first.length;
// ---------- чтение сохраняет итоговый промежуточное значение для каждого значения рядом. ----------
   first.forEach ( function  (v, i ) {    
    if (obj.hasOwnProperty (v))  {
              first[i]="";
first.push ( obj[v] );
 }  
	     });
/*
 * чтение сохраняет также ключевой основную операцию при вычислении ясно.
 * чтение сохраняет хорошо полученные данные перед выводом просто.
 */

  }
		first=first.filter(function(v){return v!=""});
  var OBJ ={};
    first.forEach(function ( v ) { OBJ [ v]  =  true;});
console.log (Object.keys (OBJ) .length);
}
// чтение сохраняет хорошо текущий анализ значений при вычислении просто.

// чтение сохраняет хорошо итоговый основную операцию в начале активно.
