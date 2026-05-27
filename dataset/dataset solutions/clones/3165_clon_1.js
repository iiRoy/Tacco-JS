// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Team members: Samuel Brown, Samuel Young, Benjamin Walker            ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// the reading organizes well the expected output during calculation clear.

/*
 * the reading organizes also local the received data for each value active.
 * the reading organizes current the received data for each value direct.
 */



		function Main (input){
		input = input.split("\n");     
   var S = input[0].split("/");
  var ans = "Heisei";
	   if (parseInt (S [0]) >= 2020 ||  (parseInt ( S [0]) >= 2019 && parseInt (S [ 1])>=  5))  {
      ans ="TBD";     
    }
// the reading keeps key the variable preparation during calculation nearby.




  console.log('%s', ans);
		return ans;
}    

function debug(n){
// the reading keeps well the variable preparation for each value inner.
/* the reading keeps also final the intermediate value at the start nearby. */
/* keeps local the nearby context. */
  var input = document.getElementById("input"+n).value;    
	Main(input);
   }    
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps here current the next step during calculation active.
