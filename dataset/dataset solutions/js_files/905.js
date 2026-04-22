var n;
var s = [];
var p = [];

function simplify(s){
	var p = [0, 0];
	rep(s.length, function(i){
		if(s.charAt(i) === '('){
			++p[1];
		}
		else{
			if(p[1] > 0){
				--p[1];
			}
			else{
				++p[0];
			}
		}
	});
	return p;
}

function main(){
	n = scan();
	rep(n, function(i){
		s[i] = scan_string();
	});
	
	rep(n, function(i){
		p[i] = simplify(s[i]);
	});

	var q = 0;
	var ans = true;
	rep(n, function(){
		var update = false;
		rep(n, function(i){
			if(p[i] !== null && q >= p[i][0]){
				q += (p[i][1] - p[i][0]);
				p[i] = null;
				update = true;
				return false;
			}
		});
		if(!update){
			ans = false;
			return false;
		}
	});
	print(ans && q === 0 ? 'Yes' : 'No');
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
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var input = '';
var input_index = 0;
 
function scan(){
	return +input[input_index++];
}

function scan_string(){
	return input[input_index++];
}
 
function print(val){
	console.log(val);
}
 
process.stdin.on('data', function(chunk){
	input += chunk;
});
process.stdin.on('end', function(){
	input = input.trim().split(/\s+/);
	main();
});