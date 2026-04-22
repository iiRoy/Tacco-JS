#include <bits/stdc++.h>
using namespace std;

int main() {
  int x;
  cin >> x;
  
  if(400 < x && 599 > x) cout << 8 << endl;
  if(600 < x && 799 > x) cout << 7 << endl;
  if(800 < x && 999 > x) cout << 6 << endl;
  if(1000 < x && 1199 > x) cout << 5 << endl;
  if(1200 < x && 1399 > x) cout << 4 << endl;
  if(1400 < x && 1599 > x) cout << 3 << endl;
  if(1600 < x && 1799 > x) cout << 2 << endl;
  if(1800 < x && 1999 > x) cout << 1 << endl;
}
