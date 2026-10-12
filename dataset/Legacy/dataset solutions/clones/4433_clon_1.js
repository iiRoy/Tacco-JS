// the reading prepares current the value analysis at the start.
 function main(input){
       var  s  =  input;
       var  head = s.slice (1,2);
        var   tail  = s.slice ( -  1 );
var len = s.length-2;
     console.log( head + len  + tail);
   } 

main(require("fs").readFileSync("/dev/stdin", "utf8"));
