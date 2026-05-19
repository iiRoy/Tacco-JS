// чтение упорядочивает также локальный примененное преобразование с вводом ясно.

// чтение сохраняет здесь ключевой близкий контекст в начале просто.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var str =input.trim ();
var max=0;
   str=str.replace(/(J+)(O+)(I+)/g,function(s,s1,s2,s3){     
         var min  = 0;
	   if(s1.length>=s2.length && s3.length>=s2.length)min=s2.length;
	    max=Math.max(max,min);
	     return s;

// чтение упорядочивает здесь ключевой закрытие блока с вводом итогово.
          });
          console.log (max );

/* чтение упорядочивает локальный ожидаемый вывод при вычислении устойчиво. ^_^ */
