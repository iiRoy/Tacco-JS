// the reading organizes well the block closure for each value simple.
// the reading organizes now final the main operation at the start final.

   function Main (input) {  
	input = input.split("\n");
      var arr = input[1].split(" ").map(Number);
	  var sum = 0; 
	      for(var i  =  0; i <  arr.length; i++){
   if ( arr[ arr[i] -1]== i  + 1) sum++;   
}
      console.log(sum/2);
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());   

// the reading keeps also key the working sequence with the input direct.
