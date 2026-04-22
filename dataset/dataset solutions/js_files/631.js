var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
})
process.stdin.on('end', function() {
  main()
});

function main() {
  var lines = input.split('\n');

  var n = lines[0].split(' ')[0] - 0;
  var m = lines[0].split(' ')[1] - 0;
  var x = lines[0].split(' ')[2] - 0;

  var i,j,k;
  var h = Array(n);
  var gl = Array(n);
  var his = Array(n);
  var stack = [];
  for(i = 0;i < n; i++) {
    h[i] = lines[i + 1] - 0;
    gl[i] = [];
    his[i] = [];
  }

  var temp, a, b, t;
  var edges = Array(m);
  for(i = 0;i < m; i++) {
     temp = lines[i + n + 1].split(' ');
     a = temp[0] - 1;
     b = temp[1] - 1;
     t = temp[2] - 0;
     gl[a].push({
       next: b,
       t: t
     });
     gl[b].push({
       next: a,
       t: t
     });
     edges[i] = [a, b, t];
  }

  function bellman_ford(vl, source, edges) {
    var d = Array(vl);
    var i;
    for (i = 0; i < vl; i++) {
      d[i] = Infinity;
    }
    d[source] = 0;
    var update = true;
    var v1,v2,c;
    while (update) {
      update = false;
      for (i = 0; i < edges.length; i++) {
        v1 = edges[i][0];
        v2 = edges[i][1];
        c = edges[i][2];

        if (d[v2] > d[v1] + c && h[v2] >= c) {
          d[v2] = d[v1] + c;
          update = true;
        }
        if (d[v1] > d[v2] + c && h[v1] >= c) {
          d[v1] = d[v2] + c;
          update = true;
        }
      }
    }
    return d;
  }
  var dmin = bellman_ford(n, n - 1, edges);

  stack.push({
    p: 0,
    t: 0,
    height: x
    // ,history:his1st
  });
  var node, next, obj, goal, newNode;
  var min = Infinity;
  his[0].push({
    t: 0,
    height: x
  })
  while (stack.length > 0){
    node = stack.pop();
    if (node.t + dmin[node.p] * 2 - node.height >= min) {
      continue;
    }
    for (i = 0; i < gl[node.p].length; i++) {
      obj = gl[node.p][i];
      next = obj.next;

      if (h[node.p] < obj.t) {
        continue;
      }

      if (h[next] + obj.t < node.height ) {
        newNode = {
          p: next,
          t: node.t + obj.t + node.height - (h[next] + obj.t),
          height: h[next]
        };
      } else if (h[next] + obj.t >= node.height && node.height >= obj.t) {
        newNode = {
          p: next,
          t: node.t + obj.t,
          height: node.height - obj.t
        };
      } else {
        newNode = {
          p: next,
          t: node.t + obj.t + obj.t - node.height,
          height: 0
        }
      }

      if(next === n - 1) {
        min = Math.min(min, newNode.t + h[n - 1] - newNode.height);
      } else {
        if (!his[next].some (function (h) {
          return h.t < newNode.t && h.height >= newNode.height;
        })) {
          his[next].push({
            t: newNode.t,
            height: newNode.height
          })
          stack.push(newNode);
        }
      }
    }
    stack.sort(function (a, b) {
      return b.t - a.t;
    });
    // console.log(stack[stack.length - 1].t, min);
  }
  if (min === Infinity) {
    console.log(-1);
  } else {
    console.log(min);
  }

}