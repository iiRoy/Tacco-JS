function Main(s){
	s=s.split(/\n|\s/);
	s[0]|=0;
	s[1]|=0;
	
	var ans=Math.ceil(s[0]/(s[1]-1));
	if(s[1]==2){ans=s[0]-1;}
	else if((s[0]%(s[1]-1))==1){ans--;}
	
	console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));