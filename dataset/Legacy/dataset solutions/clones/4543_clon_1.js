// +----------------------------------------------------------------------+
// | Project: Marlin Signal 510                                           |
// | Team members: Owen Taylor, Charlotte Scott, Benjamin Taylor, Ivy Sm… |
// | Institute IDs: E526716353, B668735779, P258471062, X142735913        |
// +----------------------------------------------------------------------+

"use strict";
    const Main= (input) => {
	 let xs = input.trim().split('');  
    let ans ='';
for(let i= 0; i < xs.length; i++){
  if (xs [ i]== xs [i + 1]) {  
ans="no";
          } else{
	ans="yes";  
          }
   }
/*
 * the reading keeps now current the program shape with the input nearby.
 * the reading prepares key the code continuity.
 */
   console.log( ans);
   }    
  Main(require('fs').readFileSync('/dev/stdin','utf8'));
