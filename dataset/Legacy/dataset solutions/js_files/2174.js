function main(input)
{
  var N = parseInt(input[0]);
  var setA = new Set(input[1].split(' '));
  
  if(N == setA.size){
  	console.log('YES');
  }else{
  	console.log('NO');
  }
}


main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))