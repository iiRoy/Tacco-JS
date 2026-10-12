l = ~~readline();
i = d => Math.pow(10, ~~d);
for(c = 0; c < l; ++c) {
	r = []; o = readline().split(' ');
	for(a = i(o[0] - 1); a + 1 < i(o[0]); ++a)
	for(b = i(o[1] - 1); b + 1 < i(o[1]); ++b)
		(a + b) * (b - a + 1) / 2 == ('' + a + b) && r.push(a + ' ' + b);
	r.length ? r.map(s => print(s)) : print('No cats.');
}