let guideInstance; // Global reference to the current learning guide object

function LearningGuide(inputData) {
    /*
     *   Constructor for initializing a new learning guide.
     *   Takes an object containing setup information.
     */
    this.currentTopic      = inputData.topicIdentifier;
    this.activities        = inputData.learningActivities;
    this.activityIndex     = 1; // Tracks the currently active activity number
    this.displayedActivity = ''; // Placeholder for the DOM element displaying the activity
}

LearningGuide.proto = LearningGuide.prototype; // A handy alias for prototype access

LearningGuide.proto.advance = function () {
    // Moves the guide forward to the next activity or topic.
    if ( this.activityIndex < this.activities.length ) {
        this.renderActivity(++this.activityIndex); // Increment and display the next activity
    } else {
        this.proceedToNextTopic(); // All activities in this topic are done, load next topic
    }
}

LearningGuide.proto.retreat = function () {
    // Steps back to the previous activity if not on the first one.
    if ( this.activityIndex > 1 ) {
        this.renderActivity(--this.activityIndex); // Decrement and display the previous activity
    }
}

LearningGuide.proto.renderActivity = function (activityNumber) {
    // Displays the content of a specific activity based on its number.
    const activityInfo = this.activities[activityNumber - 1];

    this.displayedActivity
        .html(
            $('<p class="task-description">').text(
                '(' + (this.activityIndex) + ' of ' + this.activities.length + ') ' + activityInfo.descriptionText
            )
        )
        .append(
            $('<p class="code-snippet">')
                .text('Code example: ')
                .append( $('<samp>').html(activityInfo.codeSnippet + "&nbsp;&nbsp;&crarr;") )
        );
}

LearningGuide.proto.processInput = function (userInput) {
    // Validates the user's input against the expected pattern for the current activity.
    let validationPattern = this.activities[this.activityIndex - 1].expectedPattern;

    if ( validationPattern instanceof Array ) {
        validationPattern = validationPattern.join('\\s*'); // Combine multiple patterns
    }

    if ( new RegExp(validationPattern).exec(userInput) ) {
        this.advance(); // If input matches, proceed to the next activity
    }
}

LearningGuide.proto.proceedToNextTopic = function () {
    // Initiates the loading sequence for the subsequent learning topic.
    loadTopicContent(parseInt(this.currentTopic) + 1);
}

function loadTopicContent(topicId) {
    // Fetches and displays the content for a specified learning topic.
    $.getJSON('js/topics/' + topicId + '.json', function (topicInfo) {
        topicInfo.topicIdentifier = topicId; // Assign the ID to the data object
        guideInstance = new LearningGuide(topicInfo); // Instantiate a new learning guide

        guideInstance.displayedActivity = $("<div>"); // Prepare a div for activity display
        guideInstance.renderActivity(1); // Show the very first activity of the new topic

        $('#instructionPanel').fadeOut('slow', function () {
            $(this)
                .html($('<h2>').text("Learning Guide Topic " + topicId + ": " + topicInfo.topicTitle))
                .append(guideInstance.displayedActivity)
                .fadeIn('slow');
        });
    });
}

function displayLearningOverview() {
    // Loads and presents the main index or overview of all available learning topics.
    $("#instructionPanel").fadeOut('slow', function () {
        $.getJSON('js/topics/overview.json', function (indexData) {
            const topicListing = $("<ul id=\"topic-listing\">"); // Create an unordered list for topics

            for (const entryKey in indexData.sections) {
                let listItem = $("<li>").text(indexData.sections[entryKey].heading);
                // Using an IIFE to correctly capture 'listItem' for nested operations
                ((currentListItem) => {
                    if (indexData.sections[entryKey].subsections) {
                        const subDetails = $("<ul>");
                        currentListItem.append(subDetails);
                        for (const detailKey in indexData.sections[entryKey].subsections) {
                            subDetails.append($("<li>").text(indexData.sections[entryKey].subsections[detailKey]));
                        }
                    }
                })(listItem);
                topicListing.append(listItem);
            }

            $("#instructionPanel")
                .html($("<h2>").text(indexData.mainTitle))
                .append($("<p>").text('Type "assist" to view the help message once more.'))
                .append(topicListing);
        });
        $("#instructionPanel").fadeIn("slow");
    });
}