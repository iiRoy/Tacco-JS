function main(s) {
	s = s.split("\n").map(x => Number(x));
	p = 0;
	for (i = 0; i <= Math.min(s[0], s[3]/500); i++) {
		for (j = 0; j <= Math.min(s[1], (s[3]-500*i)/100); j++) {
			if ((s[3]-500*i-100*j)%50 === 0 && (s[3]-500*i-100*j)/50 <= s[2]) {p++;};
		}
	}
	console.log(p);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

