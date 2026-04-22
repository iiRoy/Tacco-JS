var n, m;
var a = [], b = [];

function search(x){
	var l = 0, r = m;
	while(r - l > 1){
		var c = (l + r) >> 1;
		if(b[c] <= x){
			l = c;
		}
		else{
			r = c;
		}
	}
	return b[l] === x;
}

function main(){
	while(n = scan()){
		m = scan();
		rep(n, function(i){
			a[i] = scan();
		});
		rep(m, function(i){
			b[i] = scan();
		});

		a.sort(function(u, v){
			return u - v;
		});
		b.sort(function(u, v){
			return u - v;
		});

		var s = 0;
		rep(n, function(i){
			s += a[i];
		});
		var t = 0;
		rep(m, function(i){
			t += b[i];
		});

		var d = Math.floor((t - s) / 2);
		if(t - s !== 2 * d){
			print(-1);
		}
		else{
			var ans = false;
			rep(n, function(i){
				if(search(a[i] + d)){
					print(a[i] + ' ' + (a[i] + d));
					ans = true;
					return false;
				}
			});
			if(!ans){
				print(-1);
			}
		}

		a = [];
		b = [];
	}
}

function rep(a, b, c){
	if(c === undefined){
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

var input = '';

function scan(){
	return +input.pop();
}
function scan_string(){
	return input.pop();
} 
function print(val){
	console.log(val);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk){
	input += chunk;
});
process.stdin.on('end', function(){
	input = input.trim().split(/\s+/).reverse();
	main();
});