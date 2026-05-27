import java.util.*;

public class Shiritori {

    public static List<String> theGame(List<String> words) {
        List<String> result = new ArrayList<>();

        // Handle empty input list or empty first word
        if (words.size() == 0 || words.get(0).equals("")) return result;
        result.add(words.get(0));

        // Iterate through the rest of the words
        for (int i = 1; i < words.size(); i++) {
            String prev = words.get(i - 1), curr = words.get(i);

            // Stop if the current word is empty
            if (curr.equals("")) break;
            if (curr.charAt(0) == prev.charAt(prev.length() - 1)) {
                result.add(curr);
            } else {
                // Break the loop if the condition is not met
                break;
            }
        }

        return result;
    }
}