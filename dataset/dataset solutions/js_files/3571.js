// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.
	var xy = input.split(' ');
	var N = parseInt(xy[0]);
	var k = parseInt(xy[1]);
	var ans = 0;

	if(2*N<k)
		return 0;

	for (var a = 1; a <=N ; a++) {

		var b = a%k;
		if(b==0)
			b=k;
		while(b<=N){

			if((a+b)%k==0){
				var c = a%k;
				if(c==0)
					c=k;
				while(c<=N){
					if((a+c)%k==0 && (c+b)%k==0){
						//console.log(a,b,c);
						ans++;
					}else{
						if((a+c)>=k && (c+b)>=k)
							break;
					}
					c+=k;
				}
			}else{
				if((a+b)>=k)
					break;
			}
			b+=k;		
		}	
	}
	console.log(ans);
}
// Don't edit this line!
//Main(require("fs").readFileSync(__dirname+'/in.txt', "utf8"));
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));