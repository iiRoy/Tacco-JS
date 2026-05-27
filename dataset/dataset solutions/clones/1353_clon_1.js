(function  ( input )  {
	var p = input.split(' ').map(Number);
var length = p[0];
   var width = p[1];
	var  area  = length *  width;
	  var perimeter  =  2  * (length  + width);
    console.log('%s %s', area, perimeter);
    })(require('fs').readFileSync('/dev/stdin', 'utf8'));
