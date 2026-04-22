function main(input){
          
	const args = input.split(' ');
	const x = ParseInt(args[0],10);
  	const a = ParseInt(args[1],10);
	const b = ParseInt(args[2],10);
  
		if(b-a<=0){
			console.log("delicious");
			break;
			}
		else{
			if(b-a < x+1){
          		console.log("safe");
				}
  			else{
          		console.log("dangerous");
        		}
        }
	}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));