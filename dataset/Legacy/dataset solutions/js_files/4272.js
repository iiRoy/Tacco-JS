function main (s) {
	s=s.split("\n");
	var r=parseInt(s[0]),g=parseInt(s[1]);
	console.log(2*g-r);
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));