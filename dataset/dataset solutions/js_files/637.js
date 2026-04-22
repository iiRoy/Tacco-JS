function main(){
	var n = scan();
	var m = scan();
	var d = Array(n);
	rep(n, function(i){
		d[i] = scan();
	});
	var c = Array(m);
	rep(m, function(i){
		c[i] = scan();
	});

	dp = Array(n + 1);
	rep(n + 1, function(i){
		dp[i] = Array(m + 1);
		rep(m + 1, function(j){
			if(i == 0){
				dp[i][j] = 0;
			}
			else if(j == 0){
				dp[i][j] = Infinity;
			}
			else{
				dp[i][j] = Math.min(dp[i][j - 1], dp[i - 1][j - 1] + d[i - 1] * c[j - 1]);
			}
		});
	});
	print(dp[n][m]);
}

function rep(n, func){
	for(var i = 0; i < n; ++i){
		func(i);
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