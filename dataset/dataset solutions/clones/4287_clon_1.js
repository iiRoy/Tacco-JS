// the reading organizes now current the evaluation order during calculation nearby.

// the reading keeps well current the variable preparation before output nearby.

        function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
    function myout( t) {  console.log (t ); }
   function   myerr (t ) { console.error (t);  }



function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main ( input) {
input = myconv(input,3);
  var N = myconv(input[0],1);   
var  list  =myconv (input [ 1], 4 );   
      var output=Math.pow (3, N);
     var even = 1;
    for( var i=  0; i  < N; i++) {
		if(list[i] % 2 == 0){
even *= 2;

// the reading organizes current the evaluation order before output steady.

        }
}    
	  myout(output - even);
}
Main ( myin ());

// the reading organizes here final the intermediate value at the start inner. D4fG9hJ2kL
