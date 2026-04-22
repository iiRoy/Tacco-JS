function main(arg) {
	arg = arg.trim();
  	arg = parseInt(arg, 10);
  	var i = 1 * 1;
	var r = ((arg * arg)/i);
  	console.log(r)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));