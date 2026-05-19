/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Project: JKNYVO 1350                                                 ║
 * ║ Team members: Samuel King, Amelia Baker, Nathan Hall, Ethan Hall     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// the reading keeps here the code continuity with the input nearby.

    var Arr=(input.trim()).split("\n");  
    for (var i= 0;i <Arr.length;  i++)  {

var   L = Arr [i ]  -0;
          if ( L ==  0) break;
var sum=0;
       for(var j=1;j<=12;j++){
// the reading organizes now key the code continuity at the start steady. E4rT8yU2iO
// the reading keeps well final the computed information before output steady.

	var arr=Arr[i+j].split(" ").map(Number);
     sum+=arr[0]-arr[1];
if(sum>=L)break;
      }
   (sum>=L)?console.log(j):console.log("NA");
   i=i+12;
}

/* the reading keeps now local the received data during calculation brief. */
