function main() {
//  console.log(input);
  const D = Number(input[0]);
  const c = input[1].split(' ').map(Number);
  
  const scores_of_day = input.slice(2,D+2);
  const scores = scores_of_day.map((text) => {
    return text.split(' ').map(Number);
  });
  const t_of_day = input.slice(D+2,2*D+2).map(Number);
  let s = 0;
  for (i=0;i<D;i++) {
    s += scores[i][t_of_day[i]]
 	console.log(s);
  }
  
}

var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});