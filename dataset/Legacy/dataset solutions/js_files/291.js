x=require('fs').readFileSync('/dev/stdin','utf8').split(/\n/);
for(j = 0;j < x.length;j++){
y=x[j].split(/\s/);
stack = new Array();
for (i = 0; i < y.length; i++) {
        c=y[i];
         switch (c) {
            case '+': stack.push(  stack.pop() + stack.pop()); break;
            case '-': stack.push( -stack.pop() + stack.pop()); break;
            case '*': stack.push(  stack.pop() * stack.pop()); break;
            case '/': stack.push(1/stack.pop() * stack.pop()); break;
            default:  stack.push(isNaN(c) ? 0:parseFloat(c));
        }
}
console.log(stack[0].toFixed(6));
}