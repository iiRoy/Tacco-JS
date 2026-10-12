function main(){
	var n = scan();
	var x = [];
	rep(n, function(i){
		x[i] = [];
		rep(n, function(j){
			x[i][j] = scan();
		});
	});

	rep(n, function(i){
		x[i][-1] = 0;
		rep(n, function(j){
			x[i][j] += x[i][j - 1];
		});
	});

	var ans = -Infinity;
	rep(-1, n - 1, function(i){
		rep(i + 1, n, function(j){
			var y = [];
			rep(n, function(k){
				y[k] = x[k][j] - x[k][i];
			});
			var dp = [y[0]];
			rep(1, n, function(k){
				dp[k] = Math.max(dp[k - 1] + y[k], y[k]);
			});
			ans = Math.max(ans, Math.max.apply(null, dp));
		});
	});
	print(ans);
}
 
function rep(a, b, c){
	if(c == null){
		c = b;
		b = a;
		a = 0;
	}
	for(var i = a; i < b; ++i){
		c(i);
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var input = '';
var input_index = 0;
 
function scan(type){
	if(type === 'string'){
		return input[input_index++];
	}
	else{
		return +input[input_index++];
	}
}
 
function print(val){
	console.log(val);
}
 
process.stdin.on('data', function(chunk){
	input += chunk;
});
process.stdin.on('end', function(){
	input = input.split(/\s+/);
	main();
});