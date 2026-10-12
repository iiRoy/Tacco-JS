// HugeInt.js - Arbitrary size integer math package for JavaScript
// Copyright (C) 2000 Masanao Izumo <iz@onicos.co.jp>
// Version: 1.0.1
// Licence: GPL

function _HugeInt_toString()
{
    return this.toStringBase(10);
}

function _HugeInt_toStringBase(base)
{
    var i, j, hbase;
    var t;
    var ds;
    var c;
    var s;

    i = this.len;
    if(i == 0)
      return "0";
    if(i == 1 && !this.digits[0])
      return "0";

    switch(base) {
      default:
      case 10:
      j = Math.floor((2*8*i*241)/800)+2;
      hbase = 10000;
      break;

      case 16:
      j = Math.floor((2*8*i)/4)+2;
      hbase = 0x10000;
      break;

      case 8:
      j = (2*8*i)+2;
      hbase = 010000;
      break;

      case 2:
      j = (2*8*i)+2;
      hbase = 020;
      break;
    }

    t = this.clone();
    ds = t.digits;
    s = "";

    while (i && j) {
      var k = i;
      var num = 0;

      while (k--) {
        num = (num<<16) + ds[k];
        if(num < 0) num += 4294967296;
        ds[k] = Math.floor(num / hbase);
        num %= hbase;
      }

      if (ds[i-1] == 0)
        i--;
      k = 4;
      while (k--) {
        c = (num % base);
        s = "0123456789abcdef".charAt(c) + s;
        --j;
        num = Math.floor(num / base);
        if (i == 0 && num == 0) {
          break;
        }
      }
    }

    i = 0;
    while(i < s.length && s.charAt(i) == "0")
      i++;
    if(i)
      s = s.substring(i, s.length);
    if(!this.sign)
      s = "-" + s;
    return s;
}

function _HugeInt_clone()
{
  var copy, index;

  copy = new HugeInt(this.len, this.sign);
  for(index = 0; index < this.len; index++)
    copy.digits[index] = this.digits[index];
  return copy;
}

function HugeInt(len, sign)
{
  var i, x, needInit;

  this.toString = _HugeInt_toString;
  this.toStringBase = _HugeInt_toStringBase;
  this.clone = _HugeInt_clone;

  if(arguments.length == 0) {
    this.sign = true;
    this.len = len = 1;
    this.digits = new Array(1);
    needInit = true;
  } else if(arguments.length == 1) {
    x = hugeint_from_any(arguments[0]);
    if(x == arguments[0])
      x = x.clone();
    this.sign = x.sign;
    this.len = x.len;
    this.digits = x.digits;
    needInit = false;
  } else {
    this.sign = (sign ? true : false);
    this.len = len;
    this.digits = new Array(len);
    needInit = true;
  }

  if(needInit) {
    for(i = 0; i < len; i++)
      this.digits[i] = 0;
  }
}

function hugeint_norm(x)
{
  var len = x.len;
  var ds = x.digits;

  while(len-- && !ds[len])
    ;
  x.len = ++len;
  return x;
}

function hugeint_from_int(n)
{
  var sign, big;

  if(n < 0) {
    n = -n;
    sign = false;
  } else {
    sign = true;
  }

  n &= 0x7fffffff;

  if(n <= 0xffff) {
    big = new HugeInt(1, 1);
    big.digits[0] = n;
  } else {
    big = new HugeInt(2, 1);
    big.digits[0] = (n & 0xffff);
    big.digits[1] = ((n>>16) & 0xffff);
  }
  return big;
}

function hugeint_from_string(str, base)
{
  var str_i;
  var sign = true;
  var c;
  var len;
  var z;
  var zds;
  var num;
  var i;
  var blen = 1;

  str += "@";
  str_i = 0;

  if(str.charAt(str_i) == "+") {
    str_i++;
  }
  else if (str.charAt(str_i) == "-") {
    str_i++;
    sign = false;
  }

  if (str.charAt(str_i) == "@")
    return null;

  if (!base) {
    if (str.charAt(str_i) == "0") {
      c = str.charAt(str_i + 1);
      if (c == "x" || c == "X") {
        base = 16;
      }
      else if (c == "b" || c == "B") {
        base = 2;
      }
      else {
        base = 8;
      }
    }
    else {
      base = 10;
    }
  }

  if (base == 8) {
    while (str.charAt(str_i) == "0")
      str_i++;
    len = 3 * (str.length - str_i);
  }
  else {
    if (base == 16 && str.charAt(str_i) == '0' && (str.charAt(str_i+1) == "x" || str.charAt(str_i+1) == "X")) {
      str_i += 2;
    }
    if (base == 2 && str.charAt(str_i) == '0' && (str.charAt(str_i+1) == "b"||str.charAt(str_i+1) == "B")) {
      str_i += 2;
    }
    while (str.charAt(str_i) == "0")
      str_i++;
    if (str.charAt(str_i) == "@") str_i--;
    len = 4 * (str.length - str_i);
  }

  len = (len>>4)+1;
  z = new HugeInt(len, sign);
  zds = z.digits;

  while(true) {
    c = str.charAt(str_i++);
    if(c == "@")
      break;
    switch (c) {
    case '0': c = 0; break;
    case '1': c = 1; break;
    case '2': c = 2; break;
    case '3': c = 3; break;
    case '4': c = 4; break;
    case '5': c = 5; break;
    case '6': c = 6; break;
    case '7': c = 7; break;
    case '8': c = 8; break;
    case '9': c = 9; break;
    case 'a': case 'A': c = 10; break;
    case 'b': case 'B': c = 11; break;
    case 'c': case 'C': c = 12; break;
    case 'd': case 'D': c = 13; break;
    case 'e': case 'E': c = 14; break;
    case 'f': case 'F': c = 15; break;
    default:
      c = base;
      break;
    }
    if (c >= base)
      break;

    i = 0;
    num = c;
    while(true) {
      while (i<blen) {
        num += zds[i]*base;
        zds[i++] = (num & 0xffff);
        num >>>= 16;
      }
      if (num) {
        blen++;
        continue;
      }
      break;
    }
  }
  return hugeint_norm(z);
}

function hugeint_from_any(x)
{
  if(typeof(x) == "object") {
    if(x.constructor == HugeInt)
      return x;
    return HugeInt(1, 1);
  }

  if(typeof(x) == "string") {
    return hugeint_from_string(x);
  }

  if(typeof(x) == "number") {
    var i, x1, x2, fpt, np;

    if(-2147483647 <= x && x <= 2147483647) {
      return hugeint_from_int(x);
    }
    x = x + "";
    i = x.indexOf("e", 0);
    if(i == -1)
      return hugeint_from_string(x);
    x1 = x.substr(0, i);
    x2 = x.substr(i+2, x.length - (i+2));

    fpt = x1.indexOf(".", 0);
    if(fpt != -1) {
      np = x1.length - (fpt+1);
      x1 = x1.substr(0, fpt) + x1.substr(fpt+1, np);
      x2 = parseInt(x2) - np;
    } else {
      x2 = parseInt(x2);
    }
    while(x2-- > 0) {
      x1 += "0";
    }
    return hugeint_from_string(x1);
  }
  return HugeInt(1, 1);
}

function hugeint_uminus(x)
{
  var z = x.clone();
  z.sign = !z.sign;
  return hugeint_norm(z);
}

function hugeint_add_internal(x, y, sign)
{
  var z;
  var num;
  var i, len;

  sign = (sign == y.sign);
  if (x.sign != sign) {
    if (sign)
      return hugeint_sub_internal(y, x);
    return hugeint_sub_internal(x, y);
  }

  if (x.len > y.len) {
    len = x.len + 1;
    z = x; x = y; y = z;
  } else {
    len = y.len + 1;
  }
  z = new HugeInt(len, sign);

  len = x.len;
  for (i = 0, num = 0; i < len; i++) {
    num += x.digits[i] + y.digits[i];
    z.digits[i] = (num & 0xffff);
    num >>>= 16;
  }
  len = y.len;
  while (num && i < len) {
    num += y.digits[i];
    z.digits[i++] = (num & 0xffff);
    num >>>= 16;
  }
  while (i < len) {
    z.digits[i] = y.digits[i];
    i++;
  }
  z.digits[i] = (num & 0xffff);
  return hugeint_norm(z);
}

function hugeint_sub_internal(x, y)
{
  var z = 0;
  var zds;
  var num;
  var i;

  i = x.len;
  if (x.len < y.len) {
    z = x; x = y; y = z;
  }
  else if (x.len == y.len) {
    while (i > 0) {
      i--;
      if (x.digits[i] > y.digits[i]) {
        break;
      }
      if (x.digits[i] < y.digits[i]) {
        z = x; x = y; y = z;
        break;
      }
    }
  }

  z = new HugeInt(x.len, (z == 0) ? 1 : 0);
  zds = z.digits;

  for (i = 0, num = 0; i < y.len; i++) { 
    num += x.digits[i] - y.digits[i];
    zds[i] = (num & 0xffff);
    num >>>= 16;
  } 
  while (num && i < x.len) {
    num += x.digits[i];
    zds[i++] = (num & 0xffff);
    num >>>= 16;
  }
  while (i < x.len) {
    zds[i] = x.digits[i];
    i++;
  }
    
  return hugeint_norm(z);
}

function hugeint_plus(x, y)
{
  x = hugeint_from_any(x);
  y = hugeint_from_any(y);
  return hugeint_add_internal(x, y, 1);
}

function hugeint_minus(x, y)
{
  x = hugeint_from_any(x);
  y = hugeint_from_any(y);
  return hugeint_add_internal(x, y, 0);
}

function hugeint_mul(x, y)
{
  var i, j;
  var n = 0;
  var z;
  var zds, xds, yds;
  var dd, ee;
  var ylen;

  x = hugeint_from_any(x);
  y = hugeint_from_any(y);

  j = x.len + y.len + 1;
  z = new HugeInt(j, x.sign == y.sign);

  xds = x.digits;
  yds = y.digits;
  zds = z.digits;
  ylen = y.len;
  while (j--)
    zds[j] = 0;
  for (i = 0; i < x.len; i++) {
    dd = xds[i]; 
    if (dd == 0)
      continue;
    n = 0;
    for (j = 0; j < ylen; j++) {
      ee = n + dd * yds[j];
      n = zds[i + j] + ee;
      if (ee)
        zds[i + j] = (n & 0xffff);
      n >>>= 16;
    }
    if (n) {
      zds[i + j] = n;
    }
  }

  return hugeint_norm(z);
}

function hugeint_divmod(x, y, modulo)
{
  var nx = x.len;
  var ny = y.len;
  var i, j;
  var yy, z;
  var xds, yds, zds, tds;
  var t2;
  var num;
  var dd, q;
  var ee;
  var mod, div;

  yds = y.digits;
  if (ny == 0 && yds[0] == 0)
    return null;

  if (nx < ny || nx == ny && x.digits[nx - 1] < y.digits[ny - 1]) {
    if (modulo)
      return hugeint_norm(x);
    return HugeInt(1, 1);
  }

  xds = x.digits;
  if (ny == 1) {
    dd = yds[0];
    z = x.clone();
    zds = z.digits;
    t2 = 0;
    i = nx;
    while (i--) {
      t2 = t2 * 65536 + zds[i];
      zds[i] = (t2 / dd) & 0xffff;
      t2 %= dd;
    }
    z.sign = (x.sign == y.sign);
    if (modulo) {
      if (!x.sign)
        t2 = -t2;
      if (x.sign != y.sign) {
        t2 = t2 + yds[0] * (y.sign ? 1 : -1);
      }
      return hugeint_from_int(t2);
    }
    return hugeint_norm(z);
  }

  z = new HugeInt(nx == ny ? nx + 2 : nx + 1, x.sign == y.sign);
  zds = z.digits;
  if (nx == ny)
    zds[nx + 1] = 0;
  while (!yds[ny - 1])
    ny--;
  if ((dd = ((65536/(yds[ny-1]+1)) & 0xffff)) != 1) {
    yy = y.clone();
    tds = yy.digits;
    j = 0;
    num = 0;
    while (j<ny) {
      num += yds[j]*dd;
      tds[j++] = num & 0xffff;
      num >>= 16;
    }
    yds = tds;
    j = 0;
    num = 0;
    while (j<nx) {
      num += xds[j] * dd;
      zds[j++] = num & 0xffff;
      num >>= 16;
    }
    zds[j] = num & 0xffff;
  }
  else {
    zds[nx] = 0;
    j = nx;
    while (j--) zds[j] = xds[j];
  }

  j = nx==ny?nx+1:nx;
  do {
    if (zds[j] ==  yds[ny-1]) q = 65535;
    else q = ((zds[j]*65536 + zds[j-1])/yds[ny-1]) & 0xffff;
    if (q) {
      i = 0; num = 0; t2 = 0;
      do {
        t2 += yds[i] * q;
        ee = num - (t2 & 0xffff);
        num = zds[j - ny + i] + ee;
        if (ee) zds[j - ny + i] = num & 0xffff;
        num >>= 16;
        t2 >>>= 16;
      } while (++i < ny);
      num += zds[j - ny + i] - t2;
      while (num) {
        i = 0; num = 0; q--;
        do {
          ee = num + yds[i];
          num = zds[j - ny + i] + ee;
          if (ee) zds[j - ny + i] = num & 0xffff;
          num >>= 16;
        } while (++i < ny);
        num--;
      }
    }
    zds[j] = q;
  } while (--j >= ny);

  if (modulo) {
    mod = z.clone();
    if (dd) {
      zds = mod.digits;
      t2 = 0; i = ny;
      while (i--) {
        t2 = (t2*65536) + zds[i];
        zds[i] = (t2 / dd) & 0xffff;
        t2 %= dd;
      }
    }
    mod.len = ny;
    mod.sign = x.sign;
    if (x.sign != y.sign) {
      return hugeint_add_internal(mod, y, 1);
    }
    return hugeint_norm(mod);
  }

  div = z.clone();
  zds = div.digits;
  j = (nx==ny ? nx+2 : nx+1) - ny;
  for (i = 0;i < j;i++) zds[i] = zds[i+ny];
  div.len = i;
  return hugeint_norm(div);
}

function hugeint_div(x, y)
{
  x = hugeint_from_any(x);
  y = hugeint_from_any(y);
  return hugeint_divmod(x, y, 0);
}

function hugeint_mod(x, y)
{
  x = hugeint_from_any(x);
  y = hugeint_from_any(y);
  return hugeint_divmod(x, y, 1);
}

function hugeint_cmp(x, y)
{
  var xlen;

  if(x == y)
    return 0;

  x = hugeint_from_any(x);
  y = hugeint_from_any(y);
  xlen = x.len;

  if(x.sign != y.sign) {
    if(x.sign)
      return 1;
    return -1;
  }

  if (xlen < y.len)
    return (x.sign) ? -1 : 1;
  if (xlen > y.len)
    return (x.sign) ? 1 : -1;

  while(xlen-- && (x.digits[xlen] == y.digits[xlen]))
    ;
  if (-1 == xlen)
    return 0;
  return (x.digits[xlen] > y.digits[xlen]) ?
    (x.sign ? 1 : -1) :
    (x.sign ? -1 : 1);
}

function hugeint_number(x)
{
  var d = 0.0;
  var i = x.len;
  var ds = x.digits;

  while (i--) {
    d = ds[i] + 65536.0 * d;
  }
  if (!x.sign) d = -d;
  return d;
}

function calcGcd(firstValue, secondValue){
   var upper=Math.max(firstValue,secondValue);
   var lower=Math.min(firstValue,secondValue);
   while(lower!=0){
      var savedLower=lower;
      lower=upper%lower;
      upper=savedLower;
   }
   return upper;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var linesQueue=rawData.trim().split("\n");

while(true){
   var amount=linesQueue.shift()-0;
   if(amount==0)break;

   var reducedPairs=[];
   for(var rowIndex=0;rowIndex<amount;rowIndex++){
      var pair=linesQueue.shift().split(" ").map(Number);
      var pairGcd=calcGcd(pair[0],pair[1]);
      reducedPairs.push([pair[0]/pairGcd,pair[1]/pairGcd]);
   }

   var commonDenominator=1;
   reducedPairs.forEach(function(pair){
      var shared=calcGcd(pair[1],commonDenominator);
      commonDenominator=hugeint_div(hugeint_mul(pair[1],commonDenominator),shared);
   });

   reducedPairs=reducedPairs.map(function(pair){
      return pair[0]*(commonDenominator/pair[1]);
   });

   var finalMultiple=1;
   reducedPairs.forEach(function(value){
      var shared=calcGcd(value,finalMultiple);
      finalMultiple=hugeint_div(hugeint_mul(value,finalMultiple),shared);
   });

   reducedPairs.forEach(function(value){
      console.log(finalMultiple/value);
   });
}