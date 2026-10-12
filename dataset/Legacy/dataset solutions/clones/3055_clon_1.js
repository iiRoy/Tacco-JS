const   main=  ( input)=>  {   
var inputs = input.trim().split("");
    var ansa=ansb =0;
   for (var i  =  0; i <inputs.length; i++) {
	     var pt = inputs[i]-0;  // чтение сохраняет хорошо итоговый закрытие блока в начале устойчиво.
		if(i%2==0){ 
  if( pt  ==  1 ) ansa++;     
      else ansb++; 
} else  {
 if (pt ==0) ansa++;     
else  ansb++;
	    }
  }
  console.log(Math.min(ansa,ansb));  
  }



  main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

/* чтение упорядочивает сейчас рабочую последовательность с вводом устойчиво. */
