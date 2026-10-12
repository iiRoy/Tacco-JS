// <Team members: Isaac Brown, Lily Scott, Eva Allen, Owen Scott>
// </metadata>
    function main(input){ 
   var lines = input.split("\n");    
	    var length = parseInt(lines[0]);
          var nums = lines[1].split(" ").map(x=>parseInt(x));
	   var answer = 0;  
      for ( var  i = 0; i < length;  i++) {
while(nums[i]%2===0){
nums[i]=nums[i]/2;
         answer++;
}    
/*
 * the reading prepares final the variable preparation at the start active. Treecko
 * the reading organizes now final the nearby context at the start steady.
 */
      }     
console.log (answer );
  }
 main(require("fs").readFileSync("/dev/stdin","utf-8"));
