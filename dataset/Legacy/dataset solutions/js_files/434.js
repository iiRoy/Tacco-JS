var n, g;

function main(){
	while(1){
		var m = scan();
		n = scan();
		if(n == 0 && m == 0){
			break;
		}

		g = [];
		rep(n, function(i){
			g[i] = [];
		});
		rep(m, function(){
			var a = scan() - 1;
			var b = scan() - 1;
			var c = scan();
			var d = scan();
			g[a].push([c, d, b]);
			g[b].push([c, d, a]);
		});

		var q = scan();
		rep(q, function(){
			var start = scan() - 1;
			var goal = scan() - 1;
			var type = scan();
			print(dijkstra(start, goal, type));
		});
	}
}

function dijkstra(start, goal, type){
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

		var x = heap[heap.length - 1];
		var len = --heap.length;

		if(!len){
			return result;
		}

		var i = 0;
		while(i * 2 + 1 < len){
			var a = i * 2 + 1;
			var b = i * 2 + 2;

			if(b < len && heap[b] < heap[a]){
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

	function heap_empty(){
		return !heap.length;
	}

	var d = [];
	rep(n, function(i){
		d[i] = Infinity;
	});

	d[start] = 0;
	heap_push([0, start]);
	while(!heap_empty()){
		var v = heap_pop();

		if(v[0] > d[v[1]]){
			continue;
		}

		rep(g[v[1]].length, function(i){
			var edge = g[v[1]][i];
			if(d[edge[2]] > d[v[1]] + edge[type]){
				d[edge[2]] = d[v[1]] + edge[type];
				heap_push([d[edge[2]], edge[2]]);
			}
		});
	}

	return d[goal];
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