public class Main{
  
    public static void main(String[] args){
  
        if(args.length == 2){
  
            int A = Integer.valueOf(args[0]);
            int B = Integer.valueOf(args[1]);
  
            int num = Math.floorDiv(A , B) + 1;
  
            System.out.println(num);
        }
    }
}
