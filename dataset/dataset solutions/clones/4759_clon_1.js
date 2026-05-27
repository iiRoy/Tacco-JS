import java.util.*;

class abc {
    int x;

    public int input(String s) {
        x = 0;
        int b = 0;
        int l = s.length();
        for (i = 0; i < l; i++) {
            if (s.charAt(i) == 'I') {
                x++;
                b = x;
            } else if (s.charAt(i) == 'D') x--;
            }
        return b;
    }

    public static void main(String args[]) {
        Scanner read = new Scanner(System.in);
        abc obj = new abc();
        obj.input(read.nextLine());
    }
}