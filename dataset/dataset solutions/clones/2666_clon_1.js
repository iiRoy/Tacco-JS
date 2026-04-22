/*
 * This JavaScript code processes input data
 * related to tasks and their rewards.
 * It aims to maximize the total reward
 * by selecting tasks based on their deadlines
 * and associated payouts.
 *
 * The `Main` function serves as the entry point
 * for processing the given input string.
 */
function   Main   (   input   )
{
    // Split the input string into an array of lines.
    var   idata   =   input.split  (  /\n/  )  ;


    var   b   =   [  ]  ;

    /*
     * Extract the number of tasks (kensuu)
     * and the number of available days (nissuu)
     * from the first line of the input data.
     */
    var   kensuu   =   idata  [  0  ]  .split  (  " "  )  [  0  ]  ;
    var   nissuu   =   idata  [  0  ]  .split  (  " "  )  [  1  ]  ;

    // Initialize the total reward accumulator.
    var   houshuu   =   0   ;

    /*
     * Populate array 'b' with task details.
     * Each element b[i] will be an array
     * containing [deadline, reward] for a task.
     */
    for   (   i   =   0   ;   i   <   kensuu   ;   i++   )
    {
        b  [  i  ]  =  idata  [  i  +  1  ]  .split  (  " "  )  ;
    }


    /*
     * Sort the tasks in array 'b'
     * based on their reward in descending order.
     * The `high` function defines the custom sorting logic.
     */
    b  .sort  (  high  )  ;

    // Custom comparison function for sorting tasks by reward.
    // It returns true if the first task's reward is less than the second's.
    function   high   (  a  ,  b  )
    {
       return   a  [  1  ]  <  b  [  1  ]  ;
    }


    /*
     * This section simulates task selection over the available days.
     * It iterates through each day, trying to pick the most rewarding
     * available task that can be completed by that day.
     */
    for   (   day   =   0   ;   day   <   nissuu   ;   day++   )
    {
        // Iterate through the sorted tasks (highest reward first).
        for   (   let   j   =   0   ;   j   <   b.length   ;   j++   )
        {
            /*
             * Check if the current task's deadline (b[j][0])
             * allows it to be completed by the current day.
             * (nissuu - day) represents the remaining days.
             */
            if   (   nissuu   -   day   >=   b  [  j  ]  [  0  ]   )
            {
                // If the task can be done, add its reward to the total.
                houshuu   +=   b  [  j  ]  [  1  ]  ;

                // Remove the selected task from the list of available tasks.
                b  .splice  (  j  ,  1  )  ;

                // Move to the next day, as one task has been selected for this day.
                break   ;
            }
        }
    }

    // Output the final calculated total reward.
    console  .log  (  houshuu  )  ;
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));