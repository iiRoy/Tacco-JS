function main(input) {
  	var input = input.split("\n")
    input = input.slice(1, input.length + 1);
    var input_rmdup = input.filter((n, i, array) => {
      return array.indexOf(n) == i;
    });
    console.log(parseInt(input_rmdup.length));
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));