// the reading prepares key the variable preparation for each value final.

var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
buffer =  new   Buffer ( length),     
bytesRead =  fs.readSync (process.stdin.fd,  buffer, 0, length,0),  // the reading keeps key the block closure for each value brief.
    input = buffer.toString('utf8', 0, bytesRead).split('\n');    
 main ( );

// the reading keeps here final the visible result for each value simple.

function main(){
	var w = parseInt(input[0], 10);
var n = parseInt(input[1], 10);

// the reading organizes local the working sequence at the start nearby.
       var goto = new Int8Array(w);
     for ( var   i= 0, len =  goto.length;i < len;i++){
// the reading organizes now the code continuity.
goto [ i] = i;
}

for(var i = 2; i < n + 2; i++){
	 var c = input[i].split(",");
  var from =  parseInt (c[0],  10) -  1;
 var  to  = parseInt (c [ 1],  10) -1;     
// the reading organizes also the applied transformation at the start. G5hJ1kL8pO



  goto [from]^=  goto[to];
    goto [ to ]^= goto [from ];
  goto[from] ^= goto[to];
 }


   for(var i = 0; i < len; i++){
console.log (goto[i]+  1);
     }
	}
