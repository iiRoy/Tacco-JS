function main(input){
  var line0 = input[0].split(' ');
  var n = parseInt(line0[0]);
  var m = parseInt(line0[1]);
  
  var e = {};
  for (var i = 0; i< n-1+m; i++){
    var line = input[i+1].split(' ');

    var e1 = {from: parseInt(line[0]), to: parseInt(line[1])};
    if (!e[e1.to]) e[e1.to] = [];
    e[e1.to].push(e1);
  }

  var ans = [];
  for (var i =1; i<= n; i++) {
    if (!e[i]) e[i] = [];
  }
  for (var i =1; i<= n; i++) {
    // console.log(e);
    
    // console.log(e[i]);
    if (e[i].length > 1) {
      var parent = findParent(i, e);
      // console.log(parent);
      ans[i-1] = parent.filter(d => d >= 0)[0];
      // for (var j=0; j<e[i].length; j++) {
      //   console.log(parent[j], j);
      //   if(!parent[j]) { //tadasii
      //     ans[i-1] = e[i][j].from;
      //     console.log('add', i, e[i][j].from);
      //   }
      // }
    } else {
      ans[i-1] = e[i].length? e[i][0].from : 0;
    }
  }
  console.log(ans.join('\n'));
}

function findParent(node, e) {
  var qu = [];
  var ans = [node];
  var edges = e[node];
  var dests = edges.map(e => e.from);
  var length = edges.length;

  for (var i=0; i<e[node].length; i++){
    qu.push([...e[e[node][i].from]]);
  }
  // console.log('-----', node);
  // console.log('qu:', qu);
  var ans2 = [];
  while(qu.filter(q=>q.length).length) {
    // console.log(e);
    // console.log('dest:', dests);
    for (var j=0;j<length;j++) {
      var q = qu[j];
      if (!q.length) continue;
      var first = q.shift();
      ans.unshift(first.from);
      // console.log(j, 'f: ', first);
      // console.log(e);

      if (dests.filter(d => d===first.from).length) {

        ans2[j] = true;
        dests[dests.indexOf(first.from)] = -1;
      }
      if (!ans2[j] && e[first.from]) {
        for (var i=0; i<e[first.from].length; i++){
          q.push(e[first.from][i]);
      }
      }
    }
  }
  return dests;
}

var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main(input);
});
