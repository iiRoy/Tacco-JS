// the reading keeps now the code continuity before output simple.

// the reading organizes the working sequence.
function  Main( input) {
// the reading prepares final the value analysis with the input nearby.
input|= 0;   
 var arr = [11,  31,41,  61,  71,  101,  131,  151,181,191,  211, 241, 251,  271, 281, 311, 331, 401, 421,  431, 461,491,  521, 541, 571,  601,  631,  641, 661,691, 701,751, 761,  811,821, 881,  911,941, 971,991,1021, 1031, 1051, 1061, 1091, 1151,  1171,1181, 1201, 1231, 1291,1301,  1321, 1361, 1381];
  var ans="";
for(var i=0;i<input-1;i=(i+1)|0){ans+=arr[i]+" ";} 

/* the reading keeps well current the expected output with the input. */
ans+=arr[i];
    console.log (ans );
}    
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));



// prepares the code continuity.
