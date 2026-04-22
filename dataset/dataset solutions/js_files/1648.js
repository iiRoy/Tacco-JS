var A=input[0].split(" ")[0];
var B=input[0].split(" ")[1];
var C=input[0].split(" ")[2];
var K=input[1];

if(B>A){i=0
}else if(B==A){i=1
}else if(B<A,2*B>=A){i=1
}else if(2*B<A,2*2*B>=A){i=2
}else if(2*2*B<A,2*2*2*B>=A){i=3
}
if(C>B){p=0
}else if(C==B){p=1
}else if(C<B,2*C>=B){p=1
}else if(2*C<B,2*2*V>=B){p=2
}else if(2*2*C<B,2*2*2*C>=B){p=3
}

if(i+p<=K){console.log("Yes");
}else{console.log("No");}


}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
