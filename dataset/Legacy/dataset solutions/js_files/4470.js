const Main = (input) => {
	var xs = input.trim().split(' ').map(v=>parseInt(v,10));
    var ans = xs[0] + xs[1] +0;
    //console.log(xs);
    if(ans % 3 == 0){
    	console.log('Possible');
    }else if(ans % 3 != 0){
    	console.log('Impossible');
    }
    
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));