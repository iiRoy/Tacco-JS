var sample_input = require('fs').readFileSync('/dev/stdin', 'utf8');
var coefficient_sets = (sample_input.trim()).split("\n");
coefficient_sets.forEach(function(coefficient_set){
  var coefficients = coefficient_set.split(" ").map(Number);
  var a = coefficients[0];
  var b = coefficients[1];
  var c = coefficients[2];
  var d = coefficients[3];
  var e = coefficients[4];
  var f = coefficients[5];
  var x;
  var y;
  // (e*a x + -(d*b) )x = c*e - f*b
  var x = ( c*e - f*b ) / (e*a - d*b);
  var y = (c-a*x) / b;
  console.log([x,y].join(" "));
});