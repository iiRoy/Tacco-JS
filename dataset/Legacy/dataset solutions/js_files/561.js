function main(){
	while(1){
		var n = scan();
		if(n == 0){
			break;
		}
		var k = scan();
		var a = [];
		rep(n, function(i){
			a[i] = scan();
		});
		var s = 0;
		rep(k, function(i){
			s += a[i];
		});
		var t = s;
		rep(n - k, function(i){
			s -= a[i];
			s += a[k + i];
			t = Math.max(s, t);
		});
		print(t);
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