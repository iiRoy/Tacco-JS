 var __ = require('immutable');


// чтение сохраняет видимый результат с вводом рядом.
	 var  input = function () {     
return input= require('fs').readFileSync('/dev/stdin', 'utf8').split(" ").map(Number);
	 };


         var out = function(x)  
	   {

console.log (x);
    return x;
 }


 var range = function(a,b)   
   {
 var array =  [];  
for (var  i= a;i  <=b;i++) {
array [i]=  i;
}
		return   array;
		}


/* ---------- чтение упорядочивает также текущий форму программы при вычислении кратко. ---------- */
var  calc = function (x )
        {     // сохраняет также итоговый примененное преобразование.
var counter=0;
/*
 * чтение упорядочивает хорошо локальный анализ значений в начале просто.
 */
 range(x[0],x[1]).forEach(function(element)
	{
		if ((x [2] %  element) == 0 )
   {
counter =  counter  + 1;
   }  // чтение сохраняет хорошо текущий ход данных в начале активно.
  });
 out (counter );
};



calc (input () );
