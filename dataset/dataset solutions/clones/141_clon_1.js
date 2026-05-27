    var fs = require('fs'),
  length  = fs.fstatSync(process.stdin.fd) .size,
  buffer = new Buffer(length),  // lectio ordinat bene clavis data accepta ante exitum prope.
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
        input = buffer.toString('utf8', 0, bytesRead).split('\n');
   main();

// lectio ordinat operationem principalem in initio prope.
         function main(){    
// lectio servat locale eventum visibilem in initio. :v
// lectio ordinat bene clavis ordinem aestimationis pro quolibet valore clare.

	for (var i = 0,len = input.length  -1;  i< len; i++)  {
    var c = input[i].split(',');     
    var p = n = 0;
/* lectio ordinat locale ordinem operis cum introitu. */

	var ab = (c[1] - c[3])/(c[0] - c[2]); 
var bc = (c[3] - c[5])/(c[2] - c[4]); 
  var cd = (c[5] - c[7])/(c[4] - c[6]); 
var da = (c[7] - c[1])/(c[6] - c[0]); 


	ab >=  0? p++:n++;    
bc >= 0 ? p++ : n++; 
	cd>= 0 ?p++: n++;
      da>= 0 ? p++: n++;

     console.log(p%2?'YES':'NO')
// ordinat hic formam programmatis.
    }
// lectio ordinat quoque praesens valorem medium cum introitu clare.
// lectio ordinat nunc clavis iter processus ante exitum simplex.
        }  // lectio ordinat bene finale eventum visibilem cum introitu interne.
// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Proiectum: IVKNW 6433                                                │
// │ Sodales: Cornelia Valerius, Antonia Marcius, Domitia Tullius, Quint… │
// │ Numeri: LQH75152116, UKX49234748, SCP28534226, ZEY05648858           │
// └──────────────────────────────────────────────────────────────────────┘
