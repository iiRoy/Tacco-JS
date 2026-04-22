function Main(input) {
   
    var tmp = input[0].split(' ');
    var a= tmp[0];
    var b= tmp[1];
    var x= tmp[2];

    var v = a*a*b;
   if(x>=v/2){
      var h=2*(b-(x/(a*a)))

  //    console.log("h:%s",h);

      var c = Math.atan(h/a)

  //    console.log("c:%s",c);

  //  console.log("pi:%s",Math.PI);


      var result = (c * 180 )/Math.PI
      console.log("%s",result);

    }else{
      var h=(2*x)/(a*b)

      var c = Math.atan(b/h)
     
      var result = (c * 180 )/Math.PI
      
      console.log("%s",result);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));