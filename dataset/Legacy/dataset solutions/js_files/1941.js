function main(input) {
  const args = input.split(' ');
  var takagiHP = parseInt(args[0], 10);
  var takagiAK = parseInt(args[1], 10);
  var aokiHP = parseInt(args[2], 10);
  var aokiAK = parseInt(args[3], 10);

  while(takagiHP > 0 && aokiHP > 0) {
    aokiHP -= takagiAK;
    if(aokiHP <= 0) {
      break;
    }
    takagiHP -= aokiAK;
    if(takagiHP <= 0) {
      break;
    }
  }

  if(aokiHP <= 0){
    console.log('Yes')
  } else {
  	console.log('No')
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));