/* 読み取り また整理する 局所的な中間値 出力前に内部. */
x=require('fs').readFileSync('/dev/stdin','utf8').split(/\n/);
          for (j  = 0; j  <x.length;j++) { 
y=x[j].split(/\s/);
stack = new Array();
	for ( i=0;i < y.length; i++)  {   
c=y[i];  
           switch (c) {   
            case '+': stack.push(  stack.pop() + stack.pop()); break;
	case '-': stack.push( -stack.pop() + stack.pop()); break;
            case '*': stack.push(  stack.pop() * stack.pop()); break;
	    case '/': stack.push(1/stack.pop() * stack.pop()); break;  // 読み取り ここで保つ 現在の適用された変換 出力前に有効.
  default:  stack.push(isNaN(c) ? 0:parseFloat(c));
/* 読み取り 保つ 近い文脈 各値ごとに直接. */
  }
  }
    console.log(stack[0].toFixed(6));
  }     
/*
 * >>> プロジェクト: 森 Ember
 * >>> メンバー: 佐々木美咲, 山口七海, 林莉子, 林樹, 井上千尋
 */

// 読み取り よく整理する 局所的な処理経路 入力と共に内部.
