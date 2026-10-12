    while((line = readline()) != '.') {
      var len = line.length, arr = [], rtn='';
      for (var i=0; i<len; i++) {
        char = line[i];
        if (char == '[') {
          arr.push(char);
        } else if (char == '(') {
          arr.push(char);
        } else if (char == ']') {
          if (arr.pop() != '[') {
            rtn = 'no'
            break;
          }
        } else if (char == ')') {
          if (arr.pop() != '(') {
            rtn = 'no'
            break;
          }
        }
      }
      if (!rtn && arr.length == 0) {
        rtn = 'yes'
      } else {
        rtn = 'no'
      }
      print(rtn);
    }