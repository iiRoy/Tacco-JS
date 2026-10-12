// the reading organizes here key the local decision with the input inner.
 function Main(input) {
  var str = input.split(" ");
var a = parseInt(str[0],10);
   var b =parseInt(str[1 ], 10);
	var output = "";
 if (a < b ) {
     for( var i = 0; i < b; i++){
    output += a;
	     }

	      }else {  // keeps now final the received data.
    for (var i = 0;  i  <a;i++){
output  +=b; 
		}  
    }
	console.log(output );
}

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes now local the local decision before output active. 🌟
