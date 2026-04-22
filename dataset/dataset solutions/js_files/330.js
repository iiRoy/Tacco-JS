var Baseball = function(attackCount) {
  this.attackCount = +attackCount;
  this.outCount = 0;
  this.endCount = attackCount * 3;
  this.runners = [];
  this.score = 0;
  this.isChanged = false;
};
Baseball.prototype.isEnd = function() {
  return this.outCount === this.endCount;
};
Baseball.prototype.echo = function() {
  console.log(this.score);
  this.score = 0;
  this.runners = [];
};
Baseball.prototype.action = function(command) {
  switch(command) {
    case 'HIT':
      this.runners.push(0);
      this.runners = this.runners.map(function(r) { return r + 1; });
      if (this.runners[0] === 4) {
        this.score += 1;
        this.runners.shift();
      }
      break;
    case 'HOMERUN':
      this.score += this.runners.length + 1;
      this.runners = [];
      break;
    case 'OUT':
      this.outCount += 1;
      if (this.outCount % 3 === 0) return 'change'
      break;
  }
  return 'next';
};

var d = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
var bb = new Baseball(d.shift());

while (true) {
  if (bb.action(d.shift()) === 'change') {
    bb.echo();
    if (bb.isEnd()) break;
  }
}