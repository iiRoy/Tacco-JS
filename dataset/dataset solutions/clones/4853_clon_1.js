// lectio servat nunc praesens eventum visibilem pro quolibet valore prope.


	function Main() {




let s  = inS();
if(check(s[0]) == s[3] && check(s[1]) == s[2])out("Yes");
    else out("No"); 
    }



   function check(t){     
if(t == "d")return "b"
        if(t == "b")return "d"
 if(t == "p")return "q"
    if(t == "p")return "q"
  }



// lectio ordinat bene ordinem operis cum introitu directe.
let input,  inputCnt;
    function   debug ( ){
	 input = document.getElementById("input").value;
   input = input.replace( /\n/g , " " );
input = input.split(" ");
       inputCnt = 0;
	Main();
      }
   function out(output){
 console.log(output);
}
	function inI(){
// lectio servat praesens continuitatem codicis pro quolibet valore active.
return parseInt(inS(), 10); 
   }
/*
 * lectio ordinat locale praeparationem variabilium cum introitu finale.
 * lectio ordinat hic locale valorem medium.
 */
/*
 * lectio servat nunc finale notitiam computatam in initio.
 * lectio ordinat bene formam programmatis in initio finale.
 */
  function inF(){
return   parseFloat (inS ( ) );
	  }
// lectio servat hic clavis operationem principalem cum introitu prope.
	function inS(){
return input [ inputCnt++];
   }
// ordinat hic clavis eventum visibilem.



	    input = require("fs").readFileSync("/dev/stdin", "utf8");  
Main();
