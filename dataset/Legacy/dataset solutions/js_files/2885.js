using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
class ChokudaiSpeedRun002 {
    static int __cnt = 0;
#if LOCAL_ENVIRONMENT
    static string __mark = "@@@";
#endif
    static void Main(string[] args) {
#if LOCAL_ENVIRONMENT
        StreamReader __sr = new StreamReader("stdin.txt");
        string __str = __sr.ReadToEnd();
        __sr.Close();
        int __index = __str.IndexOf(__mark, 0);
        while (__index != -1) {
            __index = __str.IndexOf(__mark, __index + __mark.Length);
            __cnt++;
        }
        if (__cnt > 0) {
            Console.Write("Eenter test data no(1-{0})? ", __cnt);
            Console.Out.Flush();
            if (!int.TryParse(Console.ReadLine(), out __cnt)) __cnt = 1;
            Console.WriteLine("Select/Default test data: {0}", __cnt);
        }
        var stdin = new System.IO.StreamReader("stdin.txt");
        Console.SetIn(stdin);
#endif
        SimpleScanner sc = new SimpleScanner(__cnt);
        int N = sc.NextInt();
        //180°×（n−2）
        Console.WriteLine((N-2)*180);
    } //Main

    public static int LowerBound<T>(T[] array, int start, int end, T value, IComparer<T> comparer) {
        int low = start, high = end, mid;
        while (low < high) {
            mid = ((high - low) >> 1) + low;
            if (comparer.Compare(array[mid], value) < 0)
                low = mid + 1;
            else
                high = mid;
        }
#if LOCAL_ENVIRONMENT
        Console.Error.WriteLine($"LowerBound(array:{array.ToStringA()}");
        Console.Error.WriteLine($"LowerBound(start:{start}, end:{end}, value:{value.ToString()}) return:{low}");
#endif
        return low;
    }
    public static int LowerBound<T>(T[] array, T value) where T : IComparable {
        return LowerBound(array, 0, array.Length, value, Comparer<T>.Default);
    }

    public class BIT {
        int n;
        int[] data;
        public BIT(int size){
            n = size + 1;
            data = new int[n];
        }
        public void add(int i, int x) {
            while (i < n) {
                data[i] += x;
                i += i & -i;
            }
        }
        public int sum(int i) {
            int ret = 0;
            while (i > 0) {
                ret += data[i];
                i -= i & -i;
            }
            return ret;
        }
    }

    public class Item : IEquatable<Item>, IComparable<Item> {
        public long value1 { get; set; }
        public long value2 { get; set; }
        public Item(long value1, long value2) {
            this.value1 = value1;
            this.value2 = value2;
        }
        public override string ToString() {
            return $"[value1:{this.value1}, value2:{this.value2}]";
        }
        public bool Equals(Item other) {
            if (other == null) return false;
            return this.value1 == other.value1 && this.value2 == other.value2;
        }
        public override bool Equals(Object obj) {
            if (obj == null) return false;
            Item item = obj as Item;
            if (item == null)  return false;
            else return Equals(item);
        }
        public override int GetHashCode() {
            long hc = this.value1 * this.value2;
            return hc.GetHashCode();
        }
        public int CompareTo(Item other) {
            if (other == null) return -1;
            if (this.value1 == other.value1)
                return this.value2.CompareTo(other.value2);
            else
                return this.value1.CompareTo(other.value1);
        }
        public int Compare(Item x, Item y) {
            if (x == null) return 1;
            else return x.CompareTo(y);

        }
    }

    public class SimpleScanner {
        private int cnt;
        private string[] items;
        public SimpleScanner(int cnt = 0) {
            this.cnt = 0;
            var sb = new StringBuilder();
            var s = Console.ReadLine();
            while (s != null) {
                sb.Append(s + " ");
                s = Console.ReadLine();
            }
            this.items = sb.ToString().Split(' ');
#if LOCAL_ENVIRONMENT
            if (cnt > 0) {
                int index = Array.IndexOf(this.items, __mark + cnt.ToString());
                this.cnt = index + 1;
            }
            Console.Error.WriteLine("SimpleScanner.cnt: {0}", this.cnt);
            Console.Error.WriteLine("SimpleScanner.items: {0}", this.items.ToStringA());
#endif
        }
        public void SetCnt(int n) { this.cnt = n; }
        public int NextInt() {
            return int.Parse(this.items[this.cnt++]);
        }
        public long NextLong() {
            return long.Parse(this.items[this.cnt++]);
        }
        public string NextString() {
            return this.items[this.cnt++];
        }
        public int[] NextIntArray(int n) {
            if (n < 1) throw new IndexOutOfRangeException("引数は1以上であること！");
            var result = new int[n];
            for (var i = 0; i < n; i++) result[i] = this.NextInt();
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }
        public long[] NextLongArray(int n) {
            if (n < 1) throw new IndexOutOfRangeException("引数は1以上であること！");
            var result = new long[n];
            for (var i = 0; i < n; i++) result[i] = this.NextLong();
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }
        public string[] NextStringArray(int n) {
            if (n < 1) throw new IndexOutOfRangeException("引数は1以上であること！");
            var result = new string[n];
            for (var i = 0; i < n; i++) result[i] = this.NextString();
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("{0}", result.ToStringA());
#endif
            return result;
        }
        public int[][] NextInt2Col(int n) {
            const int M = 2;
            if (n < 1) throw new IndexOutOfRangeException("引数は1以上であること！");
            int[][] result = new int[M][] {
                new int[n],
                new int[n],
            };
            for (var i = 0; i < n; i++) {
                result[0][i] = this.NextInt();
                result[1][i] = this.NextInt();
            }
#if LOCAL_ENVIRONMENT
            Console.Error.WriteLine("NextInt2Col: [");
            for (var i = 0; i < M; i++)
                Console.Error.WriteLine("  {0},", result[i].ToStringA());
            Console.Error.WriteLine("]");
#endif
            return result;
        }
    }

}
static class Extensions {
    public static string ToStringA<T>(this T[] array, string separator = ", ", string braces = "[]") {
        string bL = braces.Length > 0 ? braces[0].ToString() : "";
        string bR = braces.Length > 1 ? braces[1].ToString() : "";
        return bL + String.Join(separator, array) + bR;
    }
}
