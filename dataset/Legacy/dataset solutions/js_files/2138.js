function PriorityQueue(){
    this.heap = [];
}

PriorityQueue.prototype = {
    push : function(x){
        var h = this.heap, i = h.length++, j;
        while(i){
            j = i-1 >> 1;
            if(h[j] <= x)break;
            h[i] = h[j];
            i = j;
        }
        h[i] = x;
    },
    pop : function(){
        var h = this.heap, r = h[0], x = h.pop();
        var i = 0, k = h.length >> 1, j;
        while (i < k) {
            j = (i << 1) + 1;
            if(h[j+1] < h[j])++j;
            if(x <= h[j])break;
            h[i] = h[j];
            i = j;
        }
        if(h.length)h[i] = x;
        return r;
    },
    size : function(){return this.heap.length;},
    top : function(){return this.heap[0];},
};

function compareNumbers2(a, b) { //for sort
    return a-b;
}
function Main(arg)
{
  var N = arg.split("\n")[0] - 0;
  var K = arg.split("\n")[1].split(" ").map(Number);
  K.sort(compareNumbers2);

  var ans = new PriorityQueue();

  for (var i = K[0]; i < K[N - 1]; i++){
    var tmp = 0;
    for (var j = 0; j < N; j++){
      tmp += (K[j] - i) * (K[j] - i);
    }
    ans.push(tmp);
  }


  console.log(ans.top());
  return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));