var __ = require('immutable');

var input = function(){
  return input= require('fs').readFileSync('/dev/stdin', 'utf8').split(" ").map(Number);
  };

var out = function(x)
{
  console.log(x);
  return x;
}

var range = function(a,b)
{
  var array = [];
  for (var i = a; i <= b; i++) {
    array[i] = i;
  }
  return array;
}

var calc = function(x)
{
  var counter=0;

  range(x[0],x[1]).forEach(function(element)
  {
    if ((x[2] % element) == 0 )
    {
      counter = counter+1;
    }
  });
  out(counter);
};

calc(input());