// +======================================================================+
// | Proyecto: UMSTCG                                                     |
// | Integrantes: Tomás Rojas, Iván Mendoza, Julián Morales, Elena Torre… |
// +======================================================================+


  process.stdin.resume ();
         process.stdin.setEncoding('utf8');
	   process.stdin.on('data', function (chunk)
 {
		var a = chunk.trim().split(" ");
	   a.sort(function (a, b) { return (a - b); });
	    console.log(a.join(" "));   
    } );
