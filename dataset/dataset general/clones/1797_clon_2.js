// This file facilitates automated submission of claims.
// Please review the instructions carefully before proceeding.

// First crucial step: Adjust the 'paramSet' object in the next section.

// Access the portal at: https://mysoc.nus.edu.sg/~tssclaim/. Ensure your bank details are updated.

// Navigate to 'Student Claim Submission' (https://mysoc.nus.edu.sg/~tssclaim/tutor/teach_claim.php?page=1)
// and click the 'Submit Claim' button for your chosen module. This will open the claim entry interface.

// Open your browser's developer console (e.g., Ctrl+Shift+I or Cmd+Option+J).
// Paste the entire contents of this script into the console and press Enter.
// A success message "Reimbursement object initialized. Run mgr.processAllClaims() to begin." should appear.

// Execute the function mgr.processAllClaims(). Wait for the alert "All submissions completed!" then click 'OK'.

// You will return to the previous page. Re-click 'Submit Claim' to verify the total claimed hours.

// To remove all claims on the current page, call mgr.removeExistingClaims().


// Configuration section: Adjust these parameters as needed.

const paramSet = {
    // Your NUS student ID, e.g., A0123456X
    userIdentifier: prompt('Your NUS student ID, e.g., A0123456X'),

    // The course code for which you are claiming hours, e.g., CS2040S
    subjectCode: 'CS3216',

    // Format: YYYY, MM (0-indexed), DD
    // This represents the first day of the academic term, typically a Monday.
    // For instance, AY2014/15 Semester 1 started on Monday, August 11th.
    semesterStart: new Date(2014, 7, 11),

    // Custom descriptions for various activity types.
    // The keys here should not be altered.
    assignmentDetails: {
        'Grading Assignments': 'Evaluated student coursework',
        'Lesson Content Creation': 'Developed instructional materials',
        'Workshop Session': 'Conducted teaching workshop'
    },

    // This function is expected to return an array of claim objects to be processed.
    produceClaimEntries: function () {
        let generatedClaims = [];

        // Example: 4 hours x 2 sessions = 8 hours for workshops
        // Example: 4 hours x 2 sessions = 8 hours for content development
        for (let sessionNum = 1; sessionNum <= 2; sessionNum++) {
            generatedClaims.push({
                eventCategory: Reimbursement.WORKSHOP_SESSION,
                sessionNum: sessionNum,
                dayOfWeek: 'SATURDAY',
                commenceTime: '0900',
                finishTime: '1300'
            });
            generatedClaims.push({
                eventCategory: Reimbursement.CONTENT_PREPARATION,
                sessionNum: sessionNum,
                dayOfWeek: 'SUNDAY',
                commenceTime: '1500',
                finishTime: '1900'
            });
        }
        // Example: 2 hours x 4 sessions = 8 hours for assignment grading (every other week)
        for (let sessionNum = 5; sessionNum <= 11; sessionNum += 2) {
            generatedClaims.push({
                eventCategory: Reimbursement.GRADING_TASKS,
                sessionNum: sessionNum,
                dayOfWeek: 'MONDAY',
                commenceTime: '1700',
                finishTime: '1900'
            });
        }

        return generatedClaims;
    }
};

// *************************************************************
// DO NOT MODIFY THE FOLLOWING CODE BLOCK UNLESS YOU ARE A DEVELOPER
// *************************************************************

const remoteModulePath = 'https://rawgit.com/nusmodifications/nus-soc-scripts/master/claims/claim.js';
let reimbursementManager = undefined;

// Use jQuery to load the external script
jQuery.getScript(remoteModulePath)
    .done(function () {
        // Once loaded, initialize the Reimbursement object
        reimbursementManager = new Reimbursement(paramSet);
    })
    .fail(function (xhrObject, scriptOptions, errorDetails) {
        // Log any errors during script loading
        console.log('Failed to load external script');
        console.log(xhrObject);
        console.log(errorDetails);
    });
// reimbursementManager.processAllClaims(); // Uncomment to auto-run on load