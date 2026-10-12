function Dice(num) {
  this.top    = num[0];
  this.front  = num[1];
  this.right  = num[2];
  this.left   = num[3];
  this.back   = num[4];
  this.bottom = num[5]

  this.roll = function(direction) {
    var tmp;
    switch (direction) {
      case 'E':
        tmp         = this.top;
        this.top    = this.left;
        this.left   = this.bottom;
        this.bottom = this.right;
        this.right  = tmp;
        break;
      case 'N':
        tmp         = this.top;
        this.top    = this.front;
        this.front  = this.bottom;
        this.bottom = this.back;
        this.back   = tmp;
        break;
      case 'S':
        tmp         = this.top;
        this.top    = this.back;
        this.back   = this.bottom;
        this.bottom = this.front;
        this.front  = tmp;
        break;
      case 'W':
        tmp         = this.top;
        this.top    = this.right;
        this.right  = this.bottom;
        this.bottom = this.left;
        this.left   = tmp
        break;
    }
  }
}



var input = ""
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
 
process.stdin.on('end', function() {
  input = input.split("\n");

  var num = input[0].split(' ').map(Number);
  var direction = input[1].split('');
  var dice = new Dice(num);

  for (i = 0; i < direction.length; i++) {
    dice.roll(direction[i]);
  }
  console.log(dice.top);
});