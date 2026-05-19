// पठन बनाए रखता है अच्छी तरह स्थानीय खंड समाप्ति इनपुट के साथ स्पष्ट.
/* ========== पठन व्यवस्थित करता है यहाँ मुख्य दृश्य परिणाम आरंभ में निकट. ========== */
	    (function(input) {
      var p = input.split('\n');
	var n= Number( p.shift () );
    var array = [ ];
	for (var   i=0; i <n;  i++){
   array[i] = [];   
  }
	while ( true){
          var commands = p.shift().split(' ');
      var command = commands [ 0];    
var   arg1= commands[ 1]; 
	   var arg2 = commands[2];    
if (command === 'quit') {
          return ;
 }
          if (command === 'push') {
         array[ Number (arg1 ) - 1] .push( arg2);  
           } else if (command === 'pop') {
console.log(array[Number(arg1) - 1].pop());
          }else  {
    var c=  array [Number(arg1)  -  1].pop ( );
             array [Number(arg2) - 1] .push (c );  // पठन बनाए रखता है भी मुख्य मुख्य क्रिया.
}
}
       })(require('fs').readFileSync('/dev/stdin', 'utf8'));
