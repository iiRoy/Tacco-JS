'use strict';
(function(stdin) {
  var lines = stdin.toString().split('\n');
  var Command = function(str) {
    this.text = str;
    this.buf = [];
  };
  Command.prototype.exec = function(command,index,option) {
    var self = this;
    var commands = {
      print : function(index) {
        self.buf.push(self.text.slice(index[0],index[1] + 1));
      },
      reverse : function(index) {
        var chars = self.text.split('');
        var reverse = chars.slice(index[0],index[1] + 1).reverse().join('');
        this.replace(index,reverse);
      },
      replace : function(index,option) {
        var chars = self.text.split('');
        chars.splice(index[0],index[1] - index[0] + 1,option);
        self.text = chars.join('');
      }
    };
    commands[command](index,option);
  }
  Command.prototype.toString = function(){
    return this.buf.join('\n');
  };
  var result = (function(source ,commands) {
    var command = new Command(source);
    commands.forEach(function(v) {
      command.exec(v[0],v.slice(1,3).map(Number),v[3]);
    });
    return command.toString();
  }(lines.shift(),lines.slice(0,lines.shift()).map(function(v){return v.split(' ')})
    ));
  console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));