function Main( input ){
    input = input.split("\n");

    /*var n = parseInt(input[0],10);
    var a = input[1].split(" ");

    for(var i = 0;i < n;i++){
        a[i] = parseInt(a[i],10);
    }*/
    input[0] = input[0].split(" ");
    var n = parseInt(input[0][0],10);
    var l = parseInt(input[0][1],10);
    var t = parseInt(input[0][2],10);

    var x,w,afx,change;
    x = new Array(100001);w  = new Array(100001);afx = new Array(100001);change = new Array(100001);
    for(var i = 0;i < n;i++){
        input[i + 1] = input[i + 1].split(" ");
        x[i] = parseInt(input[i + 1][0],10);
        w[i] = parseInt(input[i + 1][1],10);
        change[i] = 0;
    }
 
    for(var i = 0;i < n;i++){
        var a;
        if(w[i] == 1)
            a = 1;
        else
            a = -1;
        afx[i] = (x[i] + t * a) % l;
        if(afx[i] < 0)
            afx[i] += l;
    }
    for(var i = 1;i < n;i++){
        if(w[0] == w[i]){
            change[i] = 0;
        }else{
            var d = t * 2;
            
            var b,c;
            
            if(w[0] == 1){
                b = x[0];c = x[i];
            }else{
                b = x[i];c = x[0];
            }
            change[i] = 0;
            if(c >= b){
                 d -= c - b;
            }else{
                d -= l - b +c;
            }
            if(d >= 0)
            change[i]++;
            else
                d = 0;
            change[i] += d / l | 0;
        }
    }
    
    var sum = 0;
    
    for(var i = 1;i < n;i++){
        sum += change[i];
    }
    sum %= n;
    if(w[0] == 2)
        sum = (n - sum) % n;
        
    var rem = afx[0];
    afx[n] = 10000000000;
    afx.sort(function(a,b){
        if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
    });
    
    var start;
    afx[n] = -1000;
    for(var i = 0;i < n;i++){
        if(afx[i] == rem && afx[(i + 1) % n] != rem){
            start = i;
            break;
        }
        else if(afx[i] == rem && afx[(i + 1) % n] == rem){
            if(w[0] == 1)
                start = i + 1;
            else
                start = i;
            break;
        }
    }
    start = (n + start - sum) % n;

    for(var i = 0;i < n;i++){
        console.log(afx[start++]);
        if(start == n)
            start = 0;
    }
}


Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )

