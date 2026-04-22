/* -----------------------------------------------------------
 * PLEASE REVIEW THE FOLLOWING INSTRUCTIONS THOROUGHLY BEFORE PROCEEDING
 * ----------------------------------------------------------- */

/*
 * 1. >> CRITICAL ACTION << Ensure to modify the properties within the 'config' object, located in the subsequent section.
 *
 * 2. Log in to the designated portal accessible via: https://mysoc.nus.edu.sg/~tssclaim/.
 *    If not already done, provide your bank account details.
 *
 * 3. Navigate to the 'Student Claim Submission' page (URL: https://mysoc.nus.edu.sg/~tssclaim/tutor/teach_claim.php?page=1).
 *    Locate and click the 'Claim' button associated with your module.
 *    This action should reveal the interface designed for entering details regarding your teaching claim activities.
 *
 * 4. Open the JavaScript console in your browser (typically Ctrl/Cmd + Shift/Option + J).
 *    Paste the entirety of this code file into the console and then press Enter.
 *    Upon successful execution, a message stating 'Claim object successfully created. Run c.makeAllClaims() to start.' should appear.
 *
 * 5. Execute the function 'c.makeAllClaims()'.
 *    Await the display of an alert box with the message 'All claims made!', then click 'OK' to dismiss it.
 *
 * 6. You will be redirected to the previous page.
 *    Re-click the 'Claim' button and meticulously verify that the total claimed hours match your records.
 */

// To remove all existing claims on the current page, invoke the function 'c.deleteAllClaims()'.


/* -----------------------------------------------------------
 * CUSTOMIZE THE NECESSARY ATTRIBUTES WITHIN THE CONFIGURATION OBJECT BELOW
 * ----------------------------------------------------------- */

var config =
    {
        // Your unique NUSSTU ID (e.g., a0012345)
        student_id : prompt ( 'Your NUSSTU ID, such as a0012345' ),

        // The specific module for which you are submitting claims (e.g., CS1101S)
        module : 'CS3216',

        // Date format: YYYY/MM/DD
        // Important: Month values range from 0 (January) to 11 (December), while Date values are 1-31.
        // This date should correspond to the first Monday of Week 1 for the semester.
        // For example, in AY14/15 Sem 1, it was Monday, August 11.
        first_day_of_sem : new Date ( 2014 , 7 , 11 ) ,

        // Option to specify custom descriptions for the duties field for each activity type.
        // The keys provided here must not be altered.
        duties :
            {
                'Assignment Marking'        : 'Graded students\' assignments',
                'Course Material Preparation' : 'Prepared course materials',
                'Tutorial'                  : 'Conducted workshop'
            } ,

        // This particular function is expected to yield a collection of claim objects
        // representing the activities you intend to claim.
        activities_list_fn : function ()
        {
            var activities_list = [ ] ;

            // Loop 1: Tutorials and Course Material Preparation
            // This section generates 8 hours for tutorials (4 hours * 2 weeks)
            // And 8 hours for course material preparation (4 hours * 2 weeks)
            for
            (
                var week = 1 ;
                week <= 2 ;
                week ++
            )
            {
                activities_list . push
                (
                    {
                        activity_type : Claim . TUTORIAL ,
                        week          : week ,
                        day           : 'SATURDAY' ,
                        start_time    : '0900' ,
                        end_time      : '1300'
                    }
                ) ;
                activities_list . push
                (
                    {
                        activity_type : Claim . COURSE_MATERIAL_PREPARATION ,
                        week          : week ,
                        day           : 'SUNDAY' ,
                        start_time    : '1500' ,
                        end_time      : '1900'
                    }
                ) ;
            }

            // Loop 2: Assignment Marking
            // This segment handles 8 hours of assignment grading (2 hours * 4 occurrences)
            for
            (
                var week = 5 ;
                week <= 11 ;
                week += 2
            )
            {
                activities_list . push
                (
                    {
                        activity_type : Claim . ASSIGNMENT_MARKING ,
                        week          : week ,
                        day           : 'MONDAY' ,
                        start_time    : '1700' ,
                        end_time      : '1900'
                    }
                ) ;
            }

            return activities_list ;
        }
    } ;

/* -----------------------------------------------------------
 * DO NOT ALTER THE FOLLOWING CODE BLOCK UNLESS YOU ARE CERTAIN OF ITS IMPLICATIONS
 * ----------------------------------------------------------- */

var core_script = 'https://rawgit.com/nusmodifications/nus-soc-scripts/master/claims/claim.js' ;

var c = undefined ;

$ . getScript ( core_script )

    . done ( function ()
    {
        c = new Claim ( config ) ;
    } )

    . fail ( function ( jqxhr , settings , exception )
    {
        console . log ( 'Error loading script' ) ;
        console . log ( jqxhr ) ;
        console . log ( exception ) ;
    } ) ;

// c.makeAllClaims(); // Uncomment this line if you wish to automatically initiate claim submission after script load.