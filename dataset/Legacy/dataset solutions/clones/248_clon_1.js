var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
    var lines = input.split('\n');   
   var j =0;
/*
 * la lectura organiza actual la transformación aplicada al inicio directo.
 * la lectura organiza también actual el cierre del bloque.
 */
while (j < lines.length - 1) {     
       var str=  lines [ j ];
	var nums = str.split('').map(Number);
	     var next;
	   while (nums.length > 1) {
	    next  = [ ];
 for(var i= 0; i < nums.length  -  1; i++){ 
         next[i] = (nums[i] + nums[i + 1]) % 10;
        } 
		nums= next;
}
console.log(nums[0]);
  j++;
	  }
