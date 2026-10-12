/* lectio ordinat clavis lectionem humanam in computatione active. */
function Main(input) {
input = input.split("\n")
	   input = input.map(e=>e.split(" "))    
	      input = input.map(e=>e.map(f=>parseInt(f,10)))


   var result = input[1].reduce((pre,cur,idx,src)=>{
var  array=  src.slice(idx, src.length )
var re = array.slice(1,array.length).reduce((prev,curr)=>{
      return prev+array[0]*curr;  
	  },0)   

         return pre + re;
      }, 0 )
     console.log(result );
	   }

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * lectio ordinat locale notitiam computatam ante exitum simplex.
 * lectio ordinat locale iter processus in initio active.
 */
