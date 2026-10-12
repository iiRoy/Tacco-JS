function Main(input){
	var xs = input.trim().split('').map(function(v){
        return parseInt(v, 10);
    });
    var ans = 0;
    var found = false;

    for(var i = 0; i < xs.length; i++){
    	if(xs[i] == 9){
            ans = ans + 1;
            found = true;
        }else{
            ans = ans + 0;
        }
    }

    if(found && ans != 0){
        console.log('Yes');
    }else{
        console.log('No');
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));