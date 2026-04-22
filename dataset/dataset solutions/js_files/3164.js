
// 配列に全部の島のデータを突っ込む
// 各島はparent,sizeから成る、自分がどの島かはインデックスで判断。

function init_islands(n){
  var islands = [];
  for(var i=0; i<n; i++){
    islands[i] = {
      parent: i,
      size: 1,
    }
  }
  return islands;
}

function same_group(left_index, right_index, islands){
  const right_root = root(right_index, islands);
  const left_root = root(left_index, islands);
  return (right_root == left_root);
}

function merge_islands(left_index, right_index, islands){
  if(same_group(left_index, right_index, islands)){return;}
  const right_root = root(right_index, islands);
  const left_root = root(left_index, islands);
  left_root.size = left_root.size + right_root.size;
  right_root.parent = left_index;
}

function root(index, islands){
  var node = islands[index];

  if(node.parent==index){return node;}

  var root_node = root(node.parent, islands);
  node.parent = root_node.parent;
  return root_node;
}

function get_size(index, islands){
  var root_node = root(index, islands);
  return root_node.size;
}

function main(input) {
  const formatted_input = input.split('\n').map( x => x.split(' ').map( x => parseInt(x, 10) ) );
  const N = formatted_input[0][0];
  const M = formatted_input[0][1];
  var reverse_bridges = [];

for(var i=0;i<M;i++){
  reverse_bridges.push(formatted_input[1+i]);
}
reverse_bridges = reverse_bridges.reverse();

  var islands = init_islands(N);

  var unconvinience = N*(N-1)/2;
  var results = [unconvinience];

  for(bridge of reverse_bridges){
    //console.log(bridge);

    left_index = bridge[0]-1
    right_index =  bridge[1]-1

    if(!same_group(left_index, right_index, islands)){
      var diff = get_size((left_index), islands) * get_size(right_index, islands);
      unconvinience -= diff;
    }
    results.push(unconvinience);

    merge_islands(left_index, right_index, islands);
  }

  const reversed_result = results.reverse();

  for(var i = 1; i<=M ; i++){
    console.log(reversed_result[i]);
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

//02:05:00 > 