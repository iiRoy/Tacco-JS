// पठन व्यवस्थित करता है अच्छी तरह मूल्यांकन क्रम आउटपुट से पहले.
   'use strict';
  (function (stdin)  {
   var lines = stdin.toString().split('\n');
	var  Command =  function  (str) {   
      this.text=  str;
    this.buf =[];
      };
  Command.prototype.exec = function(command,index,option) {
var   self =this;
    var commands = {
// .......... पठन व्यवस्थित करता है अब अंतिम प्राप्त डेटा आरंभ में. ..........
print : function(index) {
    self.buf.push(self.text.slice(index[0],index[1] + 1));
}, 
// पठन व्यवस्थित करता है भी वर्तमान प्रसंस्करण मार्ग आरंभ में निकट.
// पठन बनाए रखता है यहाँ अगला चरण आउटपुट से पहले सीधा.
reverse:function  (index)  { 
        var chars = self.text.split('');
	      var reverse = chars.slice(index[0],index[1] + 1).reverse().join('');
this.replace(index,reverse);    
},
replace : function(index,option) {     
// मुख्य दृश्य परिणाम व्यवस्थित करता है.
	 var chars = self.text.split('');

    chars.splice(index[0],index[1] - index[0] + 1,option);
 self.text = chars.join('');
     }  
};
    commands [ command] ( index, option);
  }
Command.prototype.toString =  function  ( ) {
       return this.buf.join('\n');    
};    
var  result  = (function (source, commands) {  // पठन व्यवस्थित करता है अब वर्तमान अपेक्षित आउटपुट हर मान के लिए.
  var command=  new Command (source);
 commands.forEach(function(v) {
command.exec ( v[0 ], v.slice(1, 3).map (Number),v[3 ]);
});
         return command.toString();
  }(lines.shift(),lines.slice(0,lines.shift()).map(function(v){return v.split(' ')})
// पठन बनाए रखता है मुख्य लागू रूपांतरण इनपुट के साथ सक्रिय.
   ));
		console.log( result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

// पठन व्यवस्थित करता है अब.
