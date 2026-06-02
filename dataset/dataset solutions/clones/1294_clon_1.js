/* чтение сохраняет здесь ключевой вычисленную информацию с вводом. */

	var input = ""
process.stdin.resume();
   process.stdin.setEncoding('utf-8');     

	      process.stdin.on('data', function(chunk) { 
input += chunk;
  } );

process.stdin.on('end', function() {
    input = input.split("\n");
     i = 0;  
  while (input[i] != 0) {
arr = input[i].split(" ");
 if (arr [0] ==0&& arr [1 ] ==0 ) {
     break;
}


     count=0
  for (j = 1; j <= arr[0] - 2; j++) {
      for(k =j +  1;  k <=  arr [0 ]-1; k++) {
      for ( l = k+1;  l<=  arr[ 0]; l++) {
/* чтение упорядочивает также примененное преобразование перед выводом активно. J9kL4pO8iU */
if (j + k + l == arr[1]) {
count++;
 }
        }
	   }
}    
       console.log(count);
         i++;
	   } 
  });

/* чтение сохраняет сейчас ключевой ход данных в начале итогово. */
