function main(input) {
    var a = input[0].split(" ")[0]-0;
    var b = input[0].split(" ")[1]-0;
    var c = input[0].split(" ")[2]-0;
    var d = input[0].split(" ")[3]-0;
  var l = a+b;
  var r = c+d;
  
    console.log(l==r?"Balanced":(l>r?"Left":"Right"));
    
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))