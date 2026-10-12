function Main(s) {
	s[0] = s[0].split(" ").map(a => parseInt(a));
	const h = s[0][0] - 2;
	const w = s[0][1] - 2;
	const n = s[0][2];
	var m = [{}, {}, {}];
	for(var i = 0; i < n; i++){
		s[i] = s[i+1].split(" ").map(a => parseInt(a));
	}
	s.pop();
	s = s.sort((a,b) => a[0] - b[0]);

	var ans = Array(10).fill(0);
	var y = 1;
	for(i = 0; i < n; i++){
		var q = 0;
    	while(y + 2 < s[i][0]){
        	for(var k in m[y%3]){
				ans[m[y%3][k]]++;
			}
			m[y%3] = {};
			y++;
			q++;
			if(q >= 3) y = s[i][0] - 2;
        }
		paint(s[i][1], s[i][0]);
	}
	function paint(x, y){
		for(var i = -2; i <= 0; i++){
			if(x + i < 1) continue;
			if(x + i > w) break;
			for(var j = -2; j <= 0; j++){
				var yj = y + j;
				if(yj < 1) continue;
				if(yj > h) break;
				var s = x + i;
				if(!m[yj%3][s]) m[yj%3][s] = 1;
				else m[yj%3][s]++;
			}
		}
	}
	for(i = 0; i < 3; i++)
	for(k in m[i]){
		ans[m[i][k]]++;
	}
	ans[0] = h * w;
	var f = 0;
	if(ans[0] > 9e15){
		ans[0] = (h % 1e5 * w);
		f = Math.floor(ans[0] / 1e5);
		ans[0] %= 1e5;
	}
	for(i = 1; i <= 9; i++){
		ans[0] -= ans[i];
	}
	if(f){
		f += Math.floor(h / 1e5) * w;
		while(ans[0] < 0){
			f--;
			ans[0] += 1e5;
		}
		ans[0] = ("00000" + ans[0] % 1e5).slice(-5);
		ans[0] = f + ans[0];
	}

	console.log(ans.join("\n"));
	
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));