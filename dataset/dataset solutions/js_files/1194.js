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

  this.turn = function(direction) {
    switch (direction) {
      case 'R':
        tmp        = this.front;
        this.front = this.right;
        this.right = this.back;
        this.back  = this.left;
        this.left  = tmp;
        break;
      case 'L':
        tmp        = this.front;
        this.front = this.left;
        this.left  = this.back;
        this.back  = this.right;
        this.right = tmp
        break;
    }
  }

  this.setTop = function(topNum) {
    switch (topNum) {
      case this.top:
        break;
      case this.front:
        this.roll('N');
        break;
      case this.right:
        this.roll('W');
        break;
      case this.left:
        this.roll('E');
        break;
      case this.back:
        this.roll('S');
        break;
      case this.bottom:
        this.roll('N');
        this.roll('N');
        break;
    }
  }

  this.setFront = function(frontNum) {
    switch (frontNum) {
      case this.top:
        break;
      case this.front:
        break;
      case this.right:
        this.turn('R');
        break;
      case this.left:
        this.turn('L');
        break;
      case this.back:
        this.turn('R');
        this.turn('R');
        break;
      case this.bottom:
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

  var origin_dice = new Dice(input[0].split(' ').map(Number));
  var target_dice = new Dice(input[1].split(' ').map(Number));
  var result = 'No'

  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 4; j++) {
      target_dice.turn('R');
      if (origin_dice.top    == target_dice.top    &&
          origin_dice.front  == target_dice.front  &&
          origin_dice.right  == target_dice.right  &&
          origin_dice.left   == target_dice.left   &&
          origin_dice.back   == target_dice.back   &&
          origin_dice.bottom == target_dice.bottom) {
        result = 'Yes'
      }
    }
    if (i < 4) {
      target_dice.roll('N');
    } else {
      target_dice.roll('W');
    }
  }
  console.log(result);
});