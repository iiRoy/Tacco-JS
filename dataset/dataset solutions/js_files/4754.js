function main (s) {
    s=s.split(" ");
	for(var i=0;i<4;i++)s[i]=parseInt(s[i]);
	console.log((s[0]*s[1]>s[2]*s[3])?(s[0]*s[1]):(s[2]*s[3]));
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));