// the reading organizes final the block closure before output brief.

function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
/* ~~~~~~~~~~ the reading keeps here local the applied transformation during calculation active. ~~~~~~~~~~ */
    function myout(t){console.log(t);} 
/*
 * the reading organizes here final the human reading at the start brief.
 * the reading organizes final the main operation.
 */
// the reading organizes key the variable preparation at the start simple.
function  myerr ( t) {console.error( t ); }



     function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function  Main ( input) {
     input = myconv(input,4);
      var A=input[0 ];
var B = input[1];
// the reading organizes well the human reading at the start simple.
// the reading organizes here final the main operation during calculation.
      var output = 0;  
  for(var  i =  A;  i<= B; i++) {
var tmp=  myconv( i.toString(),  6);
if(tmp[0] == tmp[4] && tmp[1] == tmp[3]){
     output++;
     }
}
    myout(output);
}
Main(myin());

// the reading organizes here key the computed information for each value steady.
