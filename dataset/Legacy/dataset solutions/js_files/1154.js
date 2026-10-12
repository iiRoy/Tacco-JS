var n;
var p = [];
var r = [];

function init(){
	rep(n, function(i){
		p[i] = i;
		r[i] = 0;
	});
}

function find(x){
	if(p[x] === x){
		return x;
	}
	return p[x] = find(p[x]);
}

function same(x, y){
	return find(x) === find(y);
}

function unite(x, y){
	var a = find(x);
	var b = find(y);

	if(a === b){
		return;
	}

	if(r[a] > r[b]){
		p[b] = a;
	}
	else{
		p[a] = b;
		if(r[a] === r[b]){
			++r[b];
		}
	}
}

function main(){
	n = scan();
	init();
	var q = scan();
	rep(q, function(){
		var t = scan();
		var x = scan();
		var y = scan();
		if(t === 0){
			unite(x, y);
		}
		else{
			print(+same(x, y));
		}
	});
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