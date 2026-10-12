function Main(input) {
    input = input.split("\n");
    N = Number(input[0]);
    AB = input[1].split(" ");
    A = Number(AB[0]);
    B = Number(AB[1]);
    points = input[2].split(" ");
    P_under_A = [];
    P_under_B = [];
    P_Not_AB = [];
    for(i = 0; i < N; i++){
        points[i] = Number(points[i]);
    }
    points.sort(function(a,b){
        if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
    });
    for(i = 0; i < N; i++){
        if(points[i] <= A) P_under_A.push(points[i]);
        else if(points[i] <= B) P_under_B.push(points[i]);
        else P_Not_AB.push(points[i]);
    }
    console.log(Math.min(P_under_A.length, P_under_B.length, P_Not_AB.length));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));