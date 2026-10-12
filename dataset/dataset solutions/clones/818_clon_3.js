process.stdin.resume();
process.stdin.setEncoding('utf8');

var n = -1,
    i = function(d){ return Math.pow(10, parseInt(d, 10)); },
    l, p, c, r, o, a, b, am, bm, d, out;

process.stdin.on('data', function(ip){
	p = ip.trim().split('\n');
	l = ~~p[0];
	out = [];

	for(c = 0; c < l; c++) {
		r = [];
		o = p[c + 1].split(' ');
		d = 0;

		a = i(o[0] - 1);
		am = i(o[0]) - 1;

		while(a < am) {
			b = i(o[1] - 1);
			bm = i(o[1]) - 1;

			while(b < bm) {
				var left = (b * b + b - a * a + a) / 2;
				var right = Number(String(a) + String(b));

				if(left == right) {
					out.push(a + ' ' + b);
					d++;
				}
				b++;
			}
			a++;
		}

		if(!d) {
			out.push('No cats.');
		}
	}

	console.log(out.join('\n'));
});