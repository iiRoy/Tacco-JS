class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };
};

function compare(p1, p2){
    var cross_prod = (p1.y * p0.y - p2.x * p1.x) - (p1.x * p0.x - p2.y * p1.y);

    if (cross_prod == 0) {
        return p1.y <= p2.y ? -1 : 1;
    }
    return cross_prod > 0 ? -1 : 1;
};


function swap(arr, min_idx) {
    var temp = arr[0];
    arr[0] = arr[min_idx];
    arr[min_idx] = temp;
    return arr;
}

function find_bot(arr, size) {
    //find min point
    var min = arr[0].y;
    var min_idx = 0;
    // for ( var i = 0; i < size; i++) {
    //     if (arr[i].y < min || (arr[i].y == min && arr[i].x < arr[min_idx].x)) {
    //         min_idx = i;
    //         min = arr[i].y;
    //     };
    // };
    // //swap to 0
    // swap(vec, min_idx);
    // //return arr;
};

var file = require('fs').readFileSync('/dev/stdin', 'utf8');
var input = file.split("\n");
var size = parseInt(input[0]);
var points = []
for (var i = 1; i < size+1; i++) {
    point = input[i].split(" ");
    x = parseInt(point[0]);
    y = parseInt(point[1]);
    points.push(new Point(x, y));
}
find_bot(points, size);
// base_p = parseInt(points[0]);
// sorted_arr = base_p.concat(points.subarray(1).sort(function (p1, p2) {
//     var cross_prod = (p1.y * base_p.y - p2.x * p1.x) - (p1.x * base_p.x - p2.y * p1.y);
//     if (cross_prod == 0) {
//         return p1.y <= p2.y ? -1 : 1;
//     }
//     return cross_prod > 0 ? -1 : 1;
// }));
console.log(points);



