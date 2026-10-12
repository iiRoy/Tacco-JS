function Main(s){
	s|=0;
	var arr=[1,6,9,36,81,216,729,1296,6561,7776,46656,59049];
	var a=1<<29;
	
	fu(0,s,11);
	
	function fu(k,n,i){
		if(n<=0){
			if(k<a){a=k;}
		}
		else if(k<a){
			while(arr[i]>n){i--;}
			fu(k+1,n-arr[i],i);
			if(i>1){fu(k+1,n-arr[i-1],i-1);}
		}
	}
	
	console.log(a);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));