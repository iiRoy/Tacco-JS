function dice(num) {
  this.n = num;  // array
  this.rotate = function(dir) {
    if(dir == 'N') this.n = [this.n[1], this.n[5], this.n[2], this.n[3], this.n[0], this.n[4]];
    else if(dir == 'E') this.n = [this.n[3], this.n[1], this.n[0], this.n[5], this.n[4], this.n[2]];
    else if(dir == 'S') this.n = [this.n[4], this.n[0], this.n[2], this.n[3], this.n[5], this.n[1]];
    else if(dir == 'W') this.n = [this.n[2], this.n[1], this.n[5], this.n[0], this.n[4], this.n[3]];
  }
}
function Main(input) {
  input = input.split("\n");
  var dice_a = new dice(input[0].split(" "));
  input[1].split("").forEach(function(d){dice_a.rotate(d);});
  console.log(dice_a.n[0]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
