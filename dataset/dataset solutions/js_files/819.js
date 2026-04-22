st = process.stdin;
st.resume();
st.setEncoding('utf8');
n = -1, i = d => Math.pow(10, ~~d);
st.on('data', ip => {
	p = ip.split('\n');
	for(c = 0; c < p[0]; ++c) {
		r = []; o = p[c+1].split(' ');
		for(a = i(o[0] - 1); a + 1 < i(o[0]); ++a)
		for(b = i(o[1] - 1); b + 1 < i(o[1]); ++b)
			(a + b) * (b - a + 1) / 2 == ('' + a + b) && r.push(a + ' ' + b);
		r.length ? r.map(s => console.log(s)) : console.log('No cats.');
	}
})