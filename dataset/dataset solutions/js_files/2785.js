function Main(input) {
  var tmp = input.split('\n');
  var n = tmp[0];
  var arr = tmp[1].split(' ');
  for ( var i = 0; i < arr.length; i++) {
    arr[i] = parseInt(arr[i]);
  }

  arr = margeSort(arr);

  console.log(arr[arr.length / 2] - arr[arr.length / 2 - 1 ])

  

}

function margeSort(a) {
  var split = function(array) {
      //console.log('original: ' + array.toString());
      if (array.length < 2) {
        return array;
      }
      var a, b, mid = array.length / 2 | 0;
      a = split(array.slice(0, mid));
      b = split(array.slice(mid, array.length));
      return marge(array, a, b);
    },
    marge = function(array, a, b) {
      if (b === undefined) {
        return array;
      }
      var c = [], i, j;
      while (a.length > 0 && b.length > 0) {
        i = a[0], j = b[0];
        //console.log('marge: ' + a.toString() + ' <==> ' + b.toString());
        if (i < j) {
          c.push(a.shift())
        } else {
          c.push(b.shift())
        }
      }
      if (a.length === 0) {
        c = c.concat(b);
      } else if (b.length === 0) {
        c = c.concat(a);
      }
      return c;
    }
  return split(a);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));