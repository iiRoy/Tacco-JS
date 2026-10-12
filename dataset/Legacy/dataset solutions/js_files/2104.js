const main = (inputs) => {

  const array = inputs[0].split(" ");
  var eight = Number(array[0]);
  var ten = Number(array[1]);

  var answer = -1;
  var price = 0;
  var i = 0;

  var eightFlag = false;
  var tenFlag = false;

  while (price < ten + 1) {
    if (Math.floor(i * 0.08) === eight) {
      eightFlag = true;
    }
    if (Math.floor(i * 0.1) === ten) {
      tenFlag = true;
    }
    if (eightFlag === true && tenFlag === true) {
      answer = i;
      break;
    }
    eightFlag = false;
    tenFlag = false;
    price = Math.floor(i * 0.1);
    i++;
  }
  console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));