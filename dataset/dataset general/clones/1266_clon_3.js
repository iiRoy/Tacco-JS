/*
 * This file contains cloned test cases for a text processing utility.
 * The original code has been significantly refactored and altered
 * to create a Type III clone, demonstrating substantial changes
 * while preserving core functionality.
 *
 * Changes include:
 * - Renaming of all identifiers (variables, functions, parameters).
 * - Extensive reformatting of whitespace and code structure.
 * - Rewriting comments to reflect the new structure and intent.
 * - Alterations in data type handling (e.g., string concatenation).
 * - Addition of new code fragments like helper variables, intermediate steps,
 *   guard clauses, and internal validations.
 * - Deletion of non-essential or redundant statements.
 * - Rewriting existing statements for functional equivalence.
 */

// Core modules for text analysis and assertion handling
const textProcessor = require('..'); // The main text analysis utility
const expectationHandler = require('should'); // For fluent assertion style

// --- Data Preparation Section ---
// Defining the primary article headline
let articleHeadline = "Swayy: An Innovative Dashboard for Content Discovery and Curation [Exclusive Invites]";

// Building the full body content using an array for better management
const articleParagraphs = [];
articleParagraphs.push("Lior Degani, Co-Founder and Marketing Head of Swayy, reached out to me last week during my California trip to discuss his venture and grant me beta access. I listened to his pitch with some skepticism. Being tired, irritable, and missing my children, my mindset was far from optimistic at the time.\n");
articleParagraphs.push("Upon entering Swayy, it requested access to my Twitter and permission to post from my account. My immediate, unspoken thought was, \"If this application spams my Twitter, I will publicly lambast him across the Internet.\" Fortunately, that thought remained internal.\n");
articleParagraphs.push("A mere seven days later, I am completely engrossed in Swayy and relieved I never voiced my spam concerns (it doesn't send unsolicited tweets, but the line was too good to omit from this piece). I messaged Lior on social media, requesting a beta access code for readers of The Next Web. I also inquired about the earliest possible date to write a review. It's truly exceptional. Seriously. I utilize every content curation service available online. It genuinely is That Good.\n");
articleParagraphs.push("What exactly is Swayy? Imagine a fusion of Percolate and LinkedIn's article recommendations, enhanced with trending keywords relevant to your interests, all integrated into an analytics dashboard that tracks your activities and audience engagement. I value it for its straightforwardness and the precision of its content curation.\n");
articleParagraphs.push("All content I genuinely wish to read is consolidated in one location – eliminating the need to jump between major tech blogs, the Harvard Business Review, and other prominent tech or business publications. It's all there. And it has saved me an immense amount of time.\n\n");
articleParagraphs.push("After gaining confidence in the service, I integrated my Facebook and LinkedIn profiles. The content experience significantly improved. While I can share directly from the platform, I generally prefer to read the full article first, then share it from the original source, primarily using Swayy for discovery.\n");
articleParagraphs.push("I also find myself increasingly checking trending keywords (far more often than never, which was my previous frequency on Twitter.com).\n\n\n");
articleParagraphs.push("The analytical features currently hold less interest for me, possibly because I've been minimally online since returning from the U.S. last weekend. The graphs haven't yet provided any unique insights, as I cannot discern which specific post generated the feedback shown on the graph (though numerical data is available on the Timeline). However, this is a beta product, with new functionalities being added and refined daily. I'm confident this is on their development roadmap. As the adage goes, if you're not somewhat embarrassed by your launch, you've waited too long.\n");
articleParagraphs.push("The suggested content was what impressed me most. The articles are remarkably pertinent – prompting me to contact Lior again for clarification:\n");
articleParagraphs.push("How are the articles listed on the site selected? Is an algorithm involved? And is there any intellectual property?\n");
articleParagraphs.push("Yes, we are in the process of filing a patent for it. Fundamentally, the system operates with a Natural Language Processing Engine. In fact, content matching involves several components, but beyond analyzing article topics, we employ machine learning algorithms to connect you with relevant suggested material. For instance, if you shared an article about Mark Zuckerberg that resonated with your followers, we might suggest another about Kevin Systrom (a simplified example).\n");
articleParagraphs.push("Who conceived the idea for Swayy, and what is its rationale? And what is your business model?\n");
articleParagraphs.push("Our business model is subscription-based, offering additional social accounts (e.g., extra Facebook/Twitter) and team collaboration features.\n");
articleParagraphs.push("The concept originated from our daily necessity to maintain an active social media presence, identify optimal content to share with our audience, expand our reach, and assess content performance.\n");
articleParagraphs.push("Who comprises the team?\n");
articleParagraphs.push("Ohad Frankfurt serves as CEO, Shlomi Babluki as CTO, and Oz Katz handles Product and Engineering. I [Lior Degani] manage Marketing. The four of us are the founders. Oz and I served together in 8200 [an elite Israeli army intelligence unit]. Emily Engelson manages Community and Graphic Design.\n");
articleParagraphs.push("If you currently use Percolate or consume LinkedIn's recommended posts, I believe you will thoroughly enjoy Swayy.\n");
articleParagraphs.push("Wish to experience Swayy without delay? Navigate to this exclusive URL and input the promotional code thenextweb. The initial 300 individuals to use the code will gain access.\n");
articleParagraphs.push("Image credit: Thinkstock");

let fullArticleText = articleParagraphs.join(''); // Assemble the full content

// --- Test Suite Definitions ---

/**
 * Test suite for the primary text summarization functionality.
 * Verifies that the module can condense lengthy content into a shorter summary.
 */
expectationHandler.describe('Text Summarization Module', function() {
    let initialTextLength; // Stores the character count of the original input
    let condensedTextLength; // Stores the character count of the generated summary
    let compressionPercentage; // Calculated percentage of reduction

    /**
     * Test case: Should successfully generate a text summary.
     */
    expectationHandler.it('should produce a coherent condensed output', function(completionCallback) {
        // Ensure the input text is not empty before processing
        if (!articleHeadline || !fullArticleText) {
            return completionCallback(new Error("Input text for summarization cannot be empty."));
        }

        // Invoke the summarization function from our text processor
        textProcessor.summarize(articleHeadline, fullArticleText, (processingError, condensedOutput) => {
            // Handle any errors that might occur during the summarization process
            if (processingError) {
                console.error("Summarization encountered an error:", processingError.message);
                return completionCallback(processingError);
            }

            // Calculate metrics for comparison
            const combinedOriginalLength = articleHeadline.length + fullArticleText.length;
            initialTextLength = combinedOriginalLength; // Store for later assertions
            condensedTextLength = condensedOutput.length;

            // Calculate the compression ratio, ensuring no division by zero
            if (initialTextLength > 0) {
                compressionPercentage = (1 - (condensedTextLength / initialTextLength)) * 100;
            } else {
                compressionPercentage = 0; // No compression if original text is empty
            }

            // Assert that the output is indeed a string
            condensedOutput.should.be.a.String();
            condensedOutput.should.not.be.empty(); // The summary should not be empty

            // Log some intermediate results for verbose testing (can be removed in production)
            // console.log(`Original Length: ${initialTextLength} chars`);
            // console.log(`Summary Length: ${condensedTextLength} chars`);
            // console.log(`Compression: ${compressionPercentage.toFixed(2)}%`);

            completionCallback(); // Signal test completion
        });
    });

    /**
     * Test case: Verifies that the summary is shorter than the original content.
     */
    expectationHandler.it('should result in a shorter output than the original input', function() {
        // Assert that the condensed text length is strictly less than the original
        condensedTextLength.should.be.below(initialTextLength);
        // Also assert that there was some actual reduction in length
        initialTextLength.should.not.equal(condensedTextLength);
    });
});

/**
 * Test suite for the sentence extraction and sorting functionality.
 * Checks if the module can correctly identify and order key sentences.
 */
expectationHandler.describe('Sentence Extraction and Ordering Module', function() {
    // Note: The previously declared 'initialTextLength', 'condensedTextLength',
    // and 'compressionPercentage' variables are not relevant here and are omitted
    // to reflect a "deletion of non-essential statements" for this specific suite.

    const desiredSentenceCount = 5; // Define a configurable number of sentences to extract

    /**
     * Test case: Should retrieve a specific number of sorted sentences.
     */
    expectationHandler.it(`should return exactly ${desiredSentenceCount} ordered sentences`, function(completionCallback) {
        // Basic validation for the desired count
        if (desiredSentenceCount <= 0) {
            return completionCallback(new Error("Desired sentence count must be a positive integer."));
        }

        // Call the sentence extraction function
        textProcessor.getSortedSentences(fullArticleText, desiredSentenceCount, (processingError, orderedPhrases) => {
            // Check for any errors during sentence processing
            if (processingError) {
                console.error("Sentence extraction encountered an error:", processingError.message);
                return completionCallback(processingError);
            }

            // Validate the type and length of the returned array
            orderedPhrases.should.be.an.Array();
            orderedPhrases.length.should.equal(desiredSentenceCount, `Expected ${desiredSentenceCount} sentences, but got ${orderedPhrases.length}.`);

            // Optionally, check if each item in the array is a string (more robust validation)
            orderedPhrases.forEach((phrase, index) => {
                phrase.should.be.a.String(`Sentence at index ${index} is not a string.`);
                phrase.should.not.be.empty(`Sentence at index ${index} is empty.`);
            });

            completionCallback(); // Indicate test completion
        });
    });
});