var n;
var x = [];

function init(){
	x[0] = 0;
	rep(1, n, function(i){
		x[i] = x[i - 1] + i;
	});
}

function search(v){
	var l = 0, r = n;
	while(r - l > 1){
		var m = (l + r) >> 1;
		if(x[m] <= v){
			l = m;
		}
		else{
			r = m;
		}
	}
	return x[l] === v;
}

function main(){
	while(n = scan()){
		init();
		var ans = 0;
		rep(0, n - 1, function(i){
			if(search(x[i] + n)){
				++ans;
			}
		});
		print(ans);
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