process.stdin.on("data",function(c){
	var a="",m=0;
	(c+"").trim().split("\n").some(function(s){
		if(s==="-"){
			console.log(a);
			return 1;
		}
		if(/\D/.test(s)){
			a&&console.log(a);
			m=1;
			a=s;
		}
		else if(m==1){
			m=2;
		}
		else{
			a=a.slice(+s)+a.slice(0,+s);
		}
	});
}).resume();