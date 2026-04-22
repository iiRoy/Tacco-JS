process.stdin.resume();
process.stdin.setEncoding('utf8');
var input_string = '';

process.stdin.on('data', function(chunk) {
    input_string += chunk;
});

process.stdin.on('end', function() {
  const lines = input_string.split("\n");
  const n = parseInt(lines[0]);
  const ks = lines[1].split(" ");
  const k = [];
  for(var i=0; i<n; i++){
    k[i] = parseInt(ks[i]);
    }
  var t = 0;
  var changed = true;
  while(changed){
    changed = false;
    for(var i=0;i<n;i++){
      if(k[i]>0){
      for(var j=i+1;j<n&&k[i]<=k[j];j++){
        k[j]--;
      }
      k[i]--;
      t++;
        changed = true;
      }
    }
  }
  console.log(t);
});