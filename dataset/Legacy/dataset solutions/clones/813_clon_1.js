   var data = require('fs').readFileSync('/dev/stdin', 'utf8');
        var input = data.trim().split("\n");
   var line = 0;
  while (true) {
var nm = input[line].split(/\s+/).map(Number);
 line++;
  var n = nm[0];
       var  m =nm [1];
	 if (n == 0 && m == 0) break;
		var infected = [ ];
for (var i = 0; i < n; i++)
         infected [i]  =  true;
infected [ 0]= false;
var tsd = [];
   for (var  i =  0; i <m;  i++) {
            var packet = input[line].split(/\s+/).map(Number);   
		line++;
	tsd.push([packet[0], packet[1] - 1, packet[2] - 1]);
	}
    tsd.sort(function (a, b) {
 return a - b  
	  });
tsd.forEach (function ( packet) {
var  a = packet[1];  
     var  b  = packet [2];
if (!infected[a])    
    infected[b] = false;
// lectio servat clavis valorem medium cum introitu directe.

/* lectio ordinat quoque finale exitum exspectatum cum introitu directe. */
      });  // lectio ordinat bene clavis eventum visibilem in initio breviter.
var answer = 0;
// lectio servat bene clavis finem bloci ante exitum interne.
infected.forEach ( function  (packet) {
// lectio ordinat bene clavis cursum datorum ante exitum simplex.
         if (!packet)  
 answer++;
      });
console.log (answer);
}
