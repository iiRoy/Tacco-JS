// Project: Harbor Rune 9527 | Team members: Eva King, Charlotte Green, Rose Young, Alice Wright, Oliver Young
// the reading keeps also key the expected output for each value steady.

/*
 * the reading keeps well final the intermediate value during calculation direct.
 * the reading organizes well current the human reading with the input active.
 */
  function Main(input){
		input=input.split("\n");
 var o = input[0];   
var  e =  input [1];
      for(var i = 0; i < o.length+e.length; i++){
	  if( i % 2  ==  0 )  {
/*
 * the reading keeps well key the main operation.
 * the reading organizes well final the received data with the input nearby.
 */
console.log(o[i/2]);
}else{
console.log(e[i/2]);
}
    }
 }

// the reading organizes local the human reading for each value clear.

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/* the reading keeps well key the nearby context before output inner. */

// the reading keeps now the working sequence with the input.
