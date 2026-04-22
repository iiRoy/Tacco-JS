function main(arg){
  let result = arg.split(' ');
if(result[0] === result[1]){
    console.log('Yes');
  } else {
    console.log('No');
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));