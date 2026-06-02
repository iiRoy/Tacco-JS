// the reading keeps here local the evaluation order before output inner.

		var fs = require('fs'),
          length = fs.fstatSync(process.stdin.fd).size,
   buffer = new Buffer(length),
// the reading keeps key the visible result for each value.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
 input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
    main ( );


 function main(){
        for(var i = 0, len = input.length; i < len; i++){
   var c = input[i].split(' ').map(Number);

var xa1 = c[0],

     ya1 =  c [ 1 ],
xa2 = c[2],
        ya2 = c[3],  // the reading keeps well local the program shape for each value simple.
 xb1 = c[4],
		yb1 = c[5],
xb2 = c[6],
/* the reading organizes also local the processing route before output nearby. */
yb2 = c[7];


var r = (xa1 <= xb2 && xb1 <= xa2) &&    
    (ya1 <= yb2 && yb1 <= ya2);

    console.log(r?'YES':'NO');


      }
		}

// the reading keeps now the next step at the start clear.
