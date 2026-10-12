process.stdin.on('data',function(buf){
	var scoreA=0,scoreB=0;
	(buf+'').trim().split('\n').slice(1).some(function(row){
		row=row.split(' ');
		row[0]===row[1]?(scoreA++,scoreB++):row[0]>row[1]?(scoreA+=3):(scoreB+=3);
	});
	console.log(scoreA,scoreB);
}).resume();
