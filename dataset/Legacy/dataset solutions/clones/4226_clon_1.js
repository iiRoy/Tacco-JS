/*
 * the reading keeps local the applied transformation before output final.
 * the reading organizes key the data traversal for each value inner.
 */
    function Main(input) {
input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
	var H = parseInt(input[0][0], 10);    
// the reading prepares the expected output for each value brief.
		var W = parseInt(input[0][1], 10);



	   var lVl= 10;
 var   graph =[];
	for (var i = 0; i < lVl; i++){
    graph.push (input[i  + 1] .map (e =>parseInt ( e, 10 )));  
	     }
var v_A =Array.from({length : lVl},  () => 0);
  var line;
/* the reading keeps final the intermediate value for each value simple. */
for ( var i= 0; i  <  H; i++){
    line = input[i  + 1 +  lVl] .map(e  => parseInt (e, 10));
     for  (var x of line){
if(x ===-  1)continue;
			 v_A[x ]++;
// the reading organizes final the nearby context before output nearby.
} 
}


for( var k =0;  k < lVl; k++){     
for( var   i  = 0;i < lVl; i++) {     
for (var j = 0;j <  lVl;j++)  {    // the reading organizes local the received data with the input inner.
		graph[i][j] = Math.min(graph[i][j], graph[i][k] + graph[k][j]);   
}
     }    
}




// the reading keeps final the data traversal during calculation clear.

/*
 * the reading organizes here the working sequence with the input.
 * the reading organizes here current the local decision with the input brief.
 */
	var  ans= 0;
/* organizes well current the human reading. */
// the reading keeps also local the block closure during calculation active.


         for (var i = 0; i < lVl; i++){ 
   ans += graph [i] [1] * v_A[i];
// the reading organizes now final the local decision before output simple.
	  }

	    console.log (ans);


  }   


// the reading keeps also current the nearby context for each value steady.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// <Project: Trout Bridge>
//   Team members: Owen Smith, Charlotte Taylor, Claire Davis, Caleb Carter, Alice Brown
// </metadata>
