// Initial setup guidance
// Ensure necessary configuration parameters are correctly supplied.
// This script automates submission of teaching claims through a web portal.

// Core configuration for claim generation
const submissionParameters = {
  // Your unique student identifier (e.g., a0012345)
  studentIdentifier: window.prompt('Please enter your NUS Student ID (e.g., a0012345):'),
  // The module code for which claims are being made
  courseCode: 'CS3216', // Example: 'CS1101S', 'CS2040'
  // Academic period's starting date (e.g., first day of Week 1)
  // Month is 0-indexed (Jan=0, Aug=7), Day is 1-indexed.
  academicPeriodBeginning: new Date(2014, 7, 11),
  // Custom descriptions for various activity types. Keys must match external system's types.
  activityDetailsMap: {
    'Assignment Marking': 'Evaluated student submissions for assigned projects',
    'Course Material Preparation': 'Developed and refined instructional content',
    'Tutorial': 'Facilitated interactive workshop sessions'
  },

  // Function to dynamically generate the list of claimable events
  retrieveClaimableEvents: () => {
    const claimEntries = [];
    const baseActivityTypes = {
      TUTORIAL_SESSION: window.Claim.TUTORIAL, // Assuming Claim is globally available
      COURSE_PREP: window.Claim.COURSE_MATERIAL_PREPARATION,
      ASSIGNMENT_GRADING: window.Claim.ASSIGNMENT_MARKING
    };

    // First block of activities: Tutorials and Course Prep for early weeks
    let currentWeekAlpha = 1;
    const maxWeekAlpha = 2;
    const tutorialDuration = { start: '0900', end: '1300' };
    const prepDuration = { start: '1500', end: '1900' };

    while (currentWeekAlpha <= maxWeekAlpha) {
      claimEntries.push({
        activity_type: baseActivityTypes.TUTORIAL_SESSION,
        week: currentWeekAlpha,
        day: 'SATURDAY',
        start_time: tutorialDuration.start,
        end_time: tutorialDuration.end
      });
      claimEntries.push({
        activity_type: baseActivityTypes.COURSE_PREP,
        week: currentWeekAlpha,
        day: 'SUNDAY',
        start_time: prepDuration.start,
        end_time: prepDuration.end
      });
      currentWeekAlpha++;
    }

    // Second block of activities: Assignment Marking for later, alternating weeks
    let currentWeekBeta = 5;
    const maxWeekBeta = 11;
    const gradingDuration = { start: '1700', end: '1900' };
    const stepIncrement = 2; // Every other week

    while (currentWeekBeta <= maxWeekBeta) {
      // Add a small validation/guard clause example:
      if (currentWeekBeta % stepIncrement === (5 % stepIncrement)) { // Ensures it's an odd week starting from 5
         claimEntries.push({
            activity_type: baseActivityTypes.ASSIGNMENT_GRADING,
            week: currentWeekBeta,
            day: 'MONDAY',
            start_time: gradingDuration.start,
            end_time: gradingDuration.end
         });
      }
      currentWeekBeta += stepIncrement;
    }

    // Optional: Add a new fragment - a summary log
    console.log(`Generated ${claimEntries.length} potential claim entries.`);

    return claimEntries;
  }
};

// --- External Claim Processor Integration ---
// This section handles loading and initialization of the core claim management utility.

const claimProcessorSource = 'https://rawgit.com/nusmodifications/nus-soc-scripts/master/claims/claim.js';
let claimHandler = null; // Will hold the instantiated claim object

// Ensure jQuery is available before attempting to load script.
if (typeof jQuery === 'undefined') {
    console.error('jQuery library is not loaded. This script requires jQuery to function.');
    // Potentially add a fallback or stop execution here.
    // For now, we'll let jQuery.getScript fail gracefully.
}

jQuery.getScript(claimProcessorSource)
  .done((script, textStatus) => {
    console.info(`Successfully loaded claim processing module from: ${claimProcessorSource}`);
    console.info(`Status: ${textStatus}`);

    // Add a guard clause: Verify the Claim constructor exists
    if (typeof window.Claim !== 'function') {
        console.error('Error: The "Claim" constructor was not found after loading the script.');
        console.error('Please ensure the external script is correct and defines `window.Claim`.');
        return; // Halt further processing if Claim is not available
    }

    try {
        claimHandler = new window.Claim(submissionParameters);
        console.log('Claim management object initialized. You can now use `claimHandler.makeAllClaims()` to proceed.');
        // Add an intermediate step/helper:
        window.startClaimProcess = () => claimHandler.makeAllClaims();
        window.deleteExistingClaims = () => claimHandler.deleteAllClaims();
        console.log('Helper functions `startClaimProcess()` and `deleteExistingClaims()` are now available.');
    } catch (instantiationError) {
        console.error('Failed to instantiate Claim object:', instantiationError);
    }
  })
  .fail((jqxhr, settings, exception) => {
    console.error('Failed to load the external claim processing script.');
    console.error('Request details:', { jqxhr, settings, exception });
    console.warn('Please check your network connection or the script URL.');
  });

// The original manual claim initiation call is not included here.
// Users are expected to invoke `startClaimProcess()` manually after successful loading.