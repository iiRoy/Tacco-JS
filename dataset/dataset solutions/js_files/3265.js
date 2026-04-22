function Main(input) {
	tmp = input.split(" ");
	a=0;
	b=0;
	c=0;
	d=0;
	e=0;
	for ( var i = 0 ; i < 4 ; i++ ){
		if(tmp[i]=="1"){
			a=1;
			e++;
		}
		if(tmp[i]=="9"){
			b=1;
			e++;
		}
		if(tmp[i]=="7"){
			c=1;
			e++;
		}
		if(tmp[i]=="4"){
			d=1;
			e++;
		}
	}
	if(a==1 && b==1 && c==1 && d==1 && e==4){
		console.log("YES");
	}else{
		console.log("NO");
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));