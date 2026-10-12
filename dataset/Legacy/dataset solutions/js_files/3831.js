function uniq(array) {
  const uniquedArray = [];
  for (var elem of array) {
    if (uniquedArray.indexOf(elem) < 0)
      uniquedArray.push(elem);
  }
  return uniquedArray;
}

function main(input){
  const lines = input.split('\n');
  const S = lines[0];
  const K = parseInt(lines[1]);

  var part_strings = [];
  for(var i=0;i<S.length;i++){
    for(var j=0;j<S.length-i;j++){
      part_strings.push(S.slice(i,i+j+1));
    }
  }
//  console.log(part_strings);
//  console.log(part_strings.length);

  part_strings = uniq(part_strings);

//  console.log(part_strings);
//  console.log(part_strings.length);


  var result_array = [];
  for(var i=0;i<K;i++){
    var current_min_str = '';
    for(var j=0;j<part_strings.length;j++){
      var current_str = part_strings[j];
      if(current_min_str=='' && (result_array.indexOf(current_str) < 0)){current_min_str = current_str;}

      if((current_str < current_min_str) && (result_array.indexOf(current_str) < 0)){
        current_min_str = current_str;
      }
    }
    result_array.push(current_min_str);
  }

//  console.log(result_array);
  console.log(result_array[result_array.length-1]);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
