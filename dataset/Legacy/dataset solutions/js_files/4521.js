function main (s) {
    s=s.split(" ");
	console.log((parseInt(s.join())%4==0)?"YES\n":"NO\n");
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));