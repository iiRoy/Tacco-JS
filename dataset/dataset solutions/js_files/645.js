public class Main{

    public static void main(String[] args){

        if(args.length == 5){

            int N = Integer.valueOf(args[0]);
            int A = Integer.valueOf(args[1]);
            int B = Integer.valueOf(args[2]);
            int C = Integer.valueOf(args[3]);
            int D = Integer.valueOf(args[4]);

            int num1 = N % A == 0 ? Math.floorDiv(N, A) : Math.floorDiv(N, A) + 1;
            int num2 = N % C == 0 ? Math.floorDiv(N, C) : Math.floorDiv(N, C) + 1;
            int min1 = B * num1;
            int min2 = D * num2;

            System.out.println((min1 < min2 ? min1 : min2));
        }
    }
}
