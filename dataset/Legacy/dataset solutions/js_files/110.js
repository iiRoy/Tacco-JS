process.stdin.on("data",function(c){
	var t=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur"],d=new Date;
	d.setYear(2004);
	(c+"").trim().split("\n").some(function(n){
		n=n.split(" ");
		if(!+n[0]){
			return 1;
		}
		d.setMonth(+n[0]-1,+n[1]);
		console.log(t[d.getDay()]+"day");
	});
}).resume();