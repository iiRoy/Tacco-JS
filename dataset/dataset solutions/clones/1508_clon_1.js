


function Main(input) { 

input = input.split("\n");
      N = parseInt(input[0].split(" "));
    var i =0;
   var result = "No";
while(i <  N  - 2) {
		var tmp = input[i+1].split(" ");
var d_i1=  parseInt(tmp [ 0]);
var d_i2 = parseInt(tmp[1]);    
    if (d_i1== d_i2 ) {
 var tmp2 = input[i+2].split(" ");
if( parseInt (tmp2 [0 ] )== parseInt (tmp2 [ 1 ]) )  {  // чтение сохраняет хорошо текущий путь обработки для каждого значения рядом.
	var tmp3 = input[i+3].split(" ");
      if (parseInt (tmp3 [0 ] ) == parseInt (tmp3 [1] )) { 
 result = "Yes";
 break;
	   } else {
	    i += 3;
};
        } else {
i+=2;
    }
  } else {
		i++;  
    }
}
console.log(result);
  }



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
