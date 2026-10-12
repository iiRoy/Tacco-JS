function main(arg) {
	arg = arg.trim().split(' ');
	if(arg[0] === arg[1]){
    	console.log('Yes');
    } else {
    	console.log('No');
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));