var n;
var g = [];
var p = [];
var r = [];

function init(){
	rep(g.length, function(i){
		p[i] = i;
		r[i] = 0;
	});
}

function find(i){
	return p[i] === i ? i : p[i] = find(p[i]);
}

function same(i, j){
	return find(i) === find(j);
}

function unite(i, j){
	var a = find(i);
	var b = find(j);
	
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
	rep(n, function(i){
		rep(n, function(j){
			var c = scan();
			if(i < j && c !== -1){
				g[g.length] = [c, i, j];
			}
		});
	});
	g.sort(function(a, b){
		return a[0] - b[0];
	});
	init();
	var ans = 0;
	rep(g.length, function(i){
		var e = g[i];
		if(!same(e[1], e[2])){
			ans += e[0];
			unite(e[1], e[2]);
		}
	});
	print(ans);
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
	input = input.trim().split(/\s+/);
	main();
});