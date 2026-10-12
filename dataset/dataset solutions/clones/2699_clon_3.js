var $jscomp=$jscomp||{};
$jscomp.scope={};
$jscomp.ASSUME_ES5=!1;
$jscomp.ASSUME_NO_NATIVE_MAP=!1;
$jscomp.ASSUME_NO_NATIVE_SET=!1;
$jscomp.SIMPLE_FROUND_POLYFILL=!1;
$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){
  if(a!=Array.prototype&&a!=Object.prototype){
    a[b]=c.value;
  }
};
$jscomp.getGlobal=function(a){
  if("undefined"!=typeof window&&window===a)return a;
  if("undefined"!=typeof global&&null!=global)return global;
  return a;
};
$jscomp.global=$jscomp.getGlobal(this);

$jscomp.polyfill=function(a,b,c,d){
  if(b){
    c=$jscomp.global;
    a=a.split(".");
    for(d=0;d<a.length-1;d++){
      var e=a[d];
      if(!(e in c))c[e]={};
      c=c[e];
    }
    a=a[a.length-1];
    d=c[a];
    b=b(d);
    if(b!=d&&null!=b){
      $jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b});
    }
  }
};

$jscomp.polyfill("Array.from",function(a){
  return a?a:function(a,c,d){
    c=null!=c?c:function(a){return a;};
    var b=[],f="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];
    if("function"==typeof f){
      a=f.call(a);
      for(var g=0,h;!(h=a.next()).done;){
        b.push(c.call(d,h.value,g++));
      }
    }else{
      for(f=a.length,g=0;g<f;g++){
        b.push(c.call(d,a[g],g));
      }
    }
    return b;
  };
},"es6","es3");

function main(a){
  var b=a.trim().split("\n");
  a=parseInt(b[0],10);
  var c=[];
  var d=0;
  b[1]=b[1].split(" ");

  while(d<a){
    c[c.length]=parseInt(b[1][d],10);
    d++;
  }

  b=Array.from(c);
  b.sort();

  console.log(c,b);

  var e=0;
  d=0;
  for(;e<a;++e){
    if(c[e]!=b[e]){
      d+=1;
    }
  }

  var f=2>=d?"YES":"NO";
  console.log(f);
}

main(require("fs").readFileSync("/dev/stdin","utf8"));