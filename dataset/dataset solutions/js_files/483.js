var n, g, u, d;

function connected(i){
	u[i] = true;
	rep(26, function(j){
		if(g[i][j] && !u[j]){
			connected(j);
		}
	});
}

function main(){
	while(1){
		n = scan();
		if(!n){
			break;
		}

		g = [];
		u = [];
		d = [];
		rep(26, function(i){
			g[i] = [];
			d[i] = 0;
		});

		rep(n, function(){
			var s = scan('string');
			var a = s.charCodeAt(0) - 'a'.charCodeAt(0);
			var b = s.charCodeAt(s.length - 1) - 'a'.charCodeAt(0);
			g[a][b] = g[b][a] = true;
			++d[a];
			--d[b];
		});

		rep(26, function(i){
			var ind = true;
			rep(26, function(j){
				ind = !g[i][j] && ind;
			});
			if(ind){
				u[i] = true;
			}
		});

		rep(26, function(i){
			if(!u[i]){
				connected(i);
				return false;
			}
		});

		ans = true;
		rep(26, function(i){
			ans = u[i] && d[i] === 0 && ans;
		});

		print(ans ? 'OK' : 'NG');
	}
}
 
function rep(a, b, c){
	if(c == null){
		c = b;
		b = a;
		a = 0;
	}
	for(var i = a; i < b; ++i){
		if(c(i) === false){
			break;
		}
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