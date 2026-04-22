function main(){
	var n = scan();
	var m = scan();
	rep(n, function(){
		var x = scan('string');
		var y = [];
		var c = -1;
		rep(m, function(i){
			if(x.charAt(i) == 'c'){
				y.push(0);
				c = 1;
			}
			else{
				y.push(c != -1 ? c++ : -1);
			}
		});
		print(y.join(' '));
	});
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