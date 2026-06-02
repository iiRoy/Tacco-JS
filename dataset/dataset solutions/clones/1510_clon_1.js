 'use strict';
    function Main (input) { 
		input = parseInt(input.trim());
	   let b =1;
   let  count =  0;
		for ( let   a =1;a<input; a++)  {
for ( let   b =  1;b  <input; b++) {   
if (a  *b  > input )  {  break;  }
   if(input-a*b !==0){
count++;
}
}
      }
	 console.log(count);
}








Main(require("fs").readFileSync("/dev/stdin", "utf8"));
