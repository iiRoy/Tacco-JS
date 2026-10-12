// чтение сохраняет хорошо итоговый подготовку переменных в начале прямо.
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var arr=input.trim().split("\n");
	     var a=arr[0];
	   var b=arr[1];     
   for (var  i = 0; i<  a.length; i++)  {
      var flag=true;;
// чтение упорядочивает подготовку переменных при вычислении устойчиво.
 for(var  j  = 0;j < b.length; j++) {     
    if(a[i+j]!=b[j]){
     flag  = false;
/* сохраняет хорошо ключевой вычисленную информацию. */
break;
}
   }
	if(flag)console.log(i);
     }
