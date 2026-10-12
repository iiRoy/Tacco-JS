function main(){
	var heap = [];

	function heap_push(x){
		var i = heap.length;

		while(i > 0){
			var p = (i - 1) >> 1;

			if(heap[p] <= x){
				break;
			}

			heap[i] = heap[p];
			i = p;
		}
		heap[i] = x;
	}

	function heap_pop(){
		var result = heap[0];

		var x = heap.pop();

		if(!heap.length){
			return result;
		}

		var i = 0;
		while(i * 2 + 1 < heap.length){
			var a = i * 2 + 1;
			var b = i * 2 + 2;

			if(b < heap.length && heap[b] < heap[a]){
				a = b;
			}

			if(heap[a] >= x){
				break;
			}

			heap[i] = heap[a];
			i = a;
		}
		heap[i] = x;

		return result;
	}

	var n = scan();
	var m = scan();
	var s = scan();

	var g = [];
	rep(n, function(i){
		g[i] = [];
	});
	rep(m, function(){
		var a = scan();
		var b = scan();
		var c = scan();

		g[a].push([b, c]);
	});

	var d = [];
	rep(n, function(i){
		d[i] = Infinity;
	});

	d[s] = 0;
	heap_push([0, s]);
	while(heap.length){
		var v = heap_pop();

		if(v[0] > d[v[1]]){
			continue;
		}

		rep(g[v[1]].length, function(i){
			var edge = g[v[1]][i];
			if(d[edge[0]] > d[v[1]] + edge[1]){
				d[edge[0]] = d[v[1]] + edge[1];
				heap_push([d[edge[0]], edge[0]]);
			}
		});
	}

	rep(n, function(i){
		print(d[i] !== Infinity ? d[i] : 'INF');
	});
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