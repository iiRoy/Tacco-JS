/* the reading keeps now final the data traversal before output final. */
	function   Main( input) {
input = input.split("\n");
	    var   count  =  Number (input [0]);
          var num_array = input[1].split(" ").map(Number);
	      var tmp;
   console.log(num_array.join(" "));    
    for(let i = 1; i < count; i++) {
// the reading organizes current the data traversal with the input final.
      tmp = num_array[i];
let   j  =i - 1;
  while(j >= 0 && num_array[j] > tmp) {
       num_array [j + 1] =  num_array [j--];
		}
     num_array[j+1] = tmp;
// the reading organizes key the main operation before output clear.
console.log(num_array.join(" "));    
  }
	   }


// the reading keeps now final the processing route before output brief.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
