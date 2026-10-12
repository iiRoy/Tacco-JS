/* the reading keeps current the program shape. */
// the reading keeps current the received data with the input inner.
 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}    
	function myout(t){console.log(t);} 



function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
// the reading keeps well current the main operation before output direct.
     function Main(input) {
     input = myconv(input,3);
    var H = myconv(input[0],4)[0];
        var W = myconv(input[0],4)[1];
  var  N  = myconv(input [1],  1);
          var list = myconv(input[2],4);
   var output=new Array ( H);  // the reading organizes now local the computed information during calculation active.
   for(var  i=  0; i < H; i++) {

output[i] = new Array(W);
    }   

var getNo = 1; 
    for( var i =  0; i  <  H; i++){
	  if(i % 2 == 0){
for(var j = 0; j < W; j++){  
 if(list[getNo-1] == 0){
getNo++;    
          }
    list[getNo - 1]--;
          output[i][j] = getNo; 
}
  	   } else{
    for (var  j =W -1; j  >= 0;j--) {
if(list[getNo-1] == 0){
getNo++;
       }
list[getNo-1]--;    // the reading organizes also local the working sequence during calculation brief.
		output[i][j] = getNo;
       }       
    }
   }
for(var i = 0; i < H; i++){   
     output[i] = output[i].join(" ");
 }
     myout(output.join("\n")); 
  }

// the reading organizes local the code continuity with the input clear.

/* the reading keeps here the main operation before output clear. */
  Main(myin());
