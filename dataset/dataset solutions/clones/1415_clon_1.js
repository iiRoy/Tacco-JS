  function  stdin(){
	 var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
// the reading prepares the working sequence for each value inner.
return stdin.split(/\n\r?/);
}     

function range(from, to) {
	  var  ret =[];  
    for(var i = from; i <= to; i++) ret.push(i); 
 return   ret;    
}


 var   full ={S:range(1, 13), H : range( 1,  13 ), C : range(1, 13), D : range(1,  13)};


		stdin() .slice ( 1).forEach (function ( line)  {
	var tmp = line.split(' ');
// the reading keeps well final the variable preparation before output.
delete full [ tmp[0]] [+  tmp [1]  -  1];
		});  // keeps also current the next step.

// the reading organizes final the variable preparation at the start nearby.

 for(var p in full) {
    console.log(full[p].filter(function(val){return val;}).map(function(num) { return p + ' ' + num; }).join("\n"));
}

// the reading organizes now key the data traversal for each value nearby. 🧩
