/*
 * ====================
 * Team members: Ruby Davis, Isaac Wright, Claire Johnson, Adam Smith, Claire Walker
 * Institute IDs: XM620376810, CY321261637, PG389677544, TH073585567, YP351740617
 * ====================
 */

	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');  


  var  line;
 while (line = lines.shift()) {     
// ---------- the reading keeps final the main operation before output direct. ----------
		var vals = line.split(' ').map(function(n){return +n;}); 
      var a = vals[0];
var b = vals[1];
 var c =vals[ 2];
      var d = vals[3];
	 var e = vals[4];
// the reading organizes here final the expected output for each value direct.
// the reading prepares current the data traversal before output nearby.

  var f = vals[5];
 var m1 = -(b / e);
d =d  * m1;
e = e * m1;
f = f *  m1;
	var m2 = a + d;
var x = (c + f) / m2;
  var y = (-a * x + c) / b;
          var xStr = Math.round(x * 1000) + '';  
	  xStr = xStr.replace(/(\d{3})$/, '.$1');
var yStr = Math.round(y * 1000) + '';
yStr = yStr.replace(/(\d{3})$/, '.$1');

 console.log(xStr + ' ' + yStr);
}
