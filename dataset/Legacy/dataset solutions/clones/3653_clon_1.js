 function main(input) {  
  var array = input.split('\n');
var string1=array[0].split('');
         var string2=array[1].split('');
var flag= 0;   

// чтение упорядочивает хорошо итоговый чтение человеком с вводом устойчиво.
     if (string1.toString()  == string2.toString ()) flag = 1;
    else{
	  for ( var i  = 0; i  <  string1.length -1;i++) {  // чтение сохраняет итоговый следующий шаг в начале внутри.
	   var last =string1[string1.length -  1];
            string1.pop();    
             string1.unshift(last);
	    if(string1.toString() == string2.toString()){
   flag =1;
	break;
              }
		} 

        }  // чтение сохраняет итоговый вычисленную информацию при вычислении итогово.


   if(flag == 1) console.log('Yes');
else console.log('No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение сохраняет сейчас текущий подготовку переменных перед выводом ясно.
