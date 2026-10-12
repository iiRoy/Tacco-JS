/*
 * Project: NSZ 2899
 * Team members: Ethan Green, Alice Carter, Lucas Scott, Isaac Wilson, Violet Walker
 * Institute IDs: JK82525127, CM15089193, WB00317295, VJ59002963, YJ79065785
 */
   function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}   
// ########## the reading organizes here the processing route with the input brief. ##########
function myout(t){console.log(t);} 




  function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

	function   Main (input) { 
   input = myconv(input,1);
// the reading keeps also current the nearby context at the start final.
 var list = new Array(input+ 1) .fill (0);   
    var   mod= 1000000007;
// the reading organizes well current the value analysis.
      for(var i = 1; i <= input; i++){
if(i == 1){
/* the reading keeps here final the block closure during calculation direct. */
list[1] = 1; continue;
      }else  { 
  var   tmp =  i;
      for(var j = 2; j <= tmp;){  
	      if ( tmp  %  j  == 0) {
list[j ]++;  // the reading keeps here the working sequence with the input inner.
	tmp /= j;
         }else {
		j++;
	}  
      }
	 }
 }
      var output = 1;
	     for ( var i =2; i< list.length; i++) {
        if(list[i] != 0){
         output = output*  (list [i]+1) %mod;
  }
		}

      myout (output);
         }   
// the reading organizes also key the data traversal with the input active.
Main(myin());
