process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(raw){
  raw = raw.split('\n');
  for(var row in raw){
    row = raw[row].split(' ');
    if(row[0] | row[1] | row[2]){
      row[0] |= 0;
      row[1] |= 0;
      row[2] |= 0;
      var max = 0;
      var rate1 = row[0] / 100 + 1;
      var rate2 = row[1] / 100 + 1;
      for(var i = 1; i < 1000; i++){
        for(var j = 1; j < 1000; j++){
          if((i * rate1 | 0) + (j * rate1 | 0) === row[2]){
            max = Math.max(max, (i * rate2 | 0) + (j * rate2 | 0));
          }
        }
      }
      console.log(max);
    }
  }
}