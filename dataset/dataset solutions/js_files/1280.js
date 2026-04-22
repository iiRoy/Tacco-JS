var cards = function()
{
  var array = [];
  var suit = ['S','H','C','D'];
  var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  for (var i = 0; i < suit.length; i++) {
    for (var j = 0; j < numbers.length; j++) {
      array.push(suit[i] + ' ' + numbers[j].toString());
    }
  }
return array;
}

var input = function()
{
  return require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
};

var out = function(x)
{
  console.log(x);
  return x;
}

var array = input();
cards().filter(function(element)
{
  return array.indexOf(element) == -1;
}).forEach(out);