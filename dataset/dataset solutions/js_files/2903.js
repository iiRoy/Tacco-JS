function main(input) {
    const args = input.split(' ');
    const apple = parseInt(args[0], 10);
    const spieces = parseInt(args[1], 10);
    var pieces;
    var pies;
    pieces = apple * 3;
    pieces += spieces;
    pies = pieces /  pieces;
    
    console.log(pies);
  
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));