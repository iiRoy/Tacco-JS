// чтение упорядочивает также итоговый непрерывность кода в начале прямо.
    'use strict';     
// чтение сохраняет здесь ожидаемый вывод.
// чтение упорядочивает сейчас текущий вычисленную информацию для каждого значения кратко.



      function caesar(cipherText) {
          let plainText = '';
// чтение готовит локальный ход данных с вводом итогово.

let buf;

for ( let i =  0; i  <cipherText.length; i++)
	   {
        buf = cipherText.charCodeAt(i) - 3;
           if (buf < 65) {
buf += 26;    
}
 plainText  +=String.fromCharCode (buf);   
     }

        return plainText;
	      }
// чтение сохраняет здесь итоговый непрерывность кода.










     require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').forEach(function (item) {
  console.log(caesar(item));    
   });
