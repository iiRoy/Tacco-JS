const trialOutcome = [];

function assessEquality(actualValue, expectedValue, message) {
    const outcome = actualValue === expectedValue;
    trialOutcome.push({
        description: message,
        passed: outcome,
        details: outcome ? "OK" : `Expected: ${expectedValue}, Actual: ${actualValue}`
    });
    return outcome;
}

function assessInequality(actualValue, expectedValue, message) {
    const outcome = actualValue !== expectedValue;
    trialOutcome.push({
        description: message,
        passed: outcome,
        details: outcome ? "OK" : `Expected not: ${expectedValue}, Actual: ${actualValue}`
    });
    return outcome;
}

function assessType(valueToCheck, expectedType, message) {
    const outcome = typeof valueToCheck === expectedType;
    trialOutcome.push({
        description: message,
        passed: outcome,
        details: outcome ? "OK" : `Expected type: ${expectedType}, Actual type: ${typeof valueToCheck}`
    });
    return outcome;
}

let pendingTests = 0;
let totalTests = 0;

function establishTestSet(setName, testFunction) {
    console.log(`\n--- Test Set: ${setName} ---`);
    testFunction();
}

function conductVerification(caseName, verificationFunction) {
    totalTests++;
    pendingTests++;
    console.log(`  Case: ${caseName}`);
    const finishCallback = () => {
        pendingTests--;
        if (pendingTests === 0) {
            outputFinalReport();
        }
    };
    verificationFunction(finishCallback);
}

function outputFinalReport() {
    console.log("\n--- Overall Test Summary ---");
    let passedCount = 0;
    trialOutcome.forEach(result => {
        console.log(`[${result.passed ? 'PASS' : 'FAIL'}] ${result.description} - ${result.details}`);
        if (result.passed) passedCount++;
    });
    console.log(`\n${passedCount} out of ${trialOutcome.length} assertions passed.`);
}

const contentProcessor = {
    shortenText: (heading, body, completionHandler) => {
        setTimeout(() => {
            let issue = null;
            let condensedOutput = body.substring(0, Math.min(body.length, 250));
            completionHandler(issue, condensedOutput);
        }, 10);
    },

    extractOrderedPhrases: (body, quantity, completionHandler) => {
        setTimeout(() => {
            let issue = null;
            let sentenceSplitter = /[.!?]+(?=\s|$)/;
            let rawPhrases = body.split(sentenceSplitter).map(s => s.trim()).filter(s => s.length > 0);
            let orderedPhrases = rawPhrases.slice(0, quantity);
            completionHandler(issue, orderedPhrases);
        }, 10);
    }
};

const mainHeading = "Swayy is a beautiful new dashboard for discovering and curating online content [Invites]";
let textBody = "";
textBody += "Lior Degani, the Co-Founder and head of Marketing of Swayy, pinged me last week when I was in California to tell me about his startup and give me beta access. I heard his pitch and was skeptical. I was also tired, cranky and missing my kids – so my frame of mind wasn't the most positive.\n";
textBody += "I went into Swayy to check it out, and when it asked for access to my Twitter and permission to tweet from my account, all I could think was, \"If this thing spams my Twitter account I am going to bitch-slap him all over the Internet.\" Fortunately that thought stayed in my head, and not out of my mouth.\n";
textBody += "One week later, I'm totally addicted to Swayy and glad I said nothing about the spam (it doesn't send out spam tweets but I liked the line too much to not use it for this article). I pinged Lior on Facebook with a request for a beta access code for TNW readers. I also asked how soon can I write about it. It's that good. Seriously. I use every content curation service online. It really is That Good.\n";
textBody += "What is Swayy? It's like Percolate and LinkedIn recommended articles, mixed with trending keywords for the topics you find interesting, combined with an analytics dashboard that shows the trends of what you do and how people react to it. I like it for the simplicity and accuracy of the content curation.\n";
textBody += "Everything I'm actually interested in reading is in one place – I don't have to skip from another major tech blog over to Harvard Business Review then hop over to another major tech or business blog. It's all in there. And it has saved me So Much Time\n\n";
textBody += "After I decided that I trusted the service, I added my Facebook and LinkedIn accounts. The content just got That Much Better. I can share from the service itself, but I generally prefer reading the actual post first – so I end up sharing it from the main link, using Swayy more as a service for discovery.\n";
textBody += "I'm also finding myself checking out trending keywords more often (more often than never, which is how often I do it on Twitter.com).\n\n\n";
textBody += "The analytics side isn't as interesting for me right now, but that could be due to the fact that I've barely been online since I came back from the US last weekend. The graphs also haven't given me any particularly special insights as I can't see which post got the actual feedback on the graph side (however there are numbers on the Timeline side.) This is a Beta though, and new features are being added and improved daily. I'm sure this is on the list. As they say, if you aren't launching with something you're embarrassed by, you've waited too long to launch.\n";
textBody += "It was the suggested content that impressed me the most. The articles really are spot on – which is why I pinged Lior again to ask a few questions:\n";
textBody += "How do you choose the articles listed on the site? Is there an algorithm involved? And is there any IP?\n";
textBody += "Yes, we're in the process of filing a patent for it. But basically the system works with a Natural Language Processing Engine. Actually, there are several parts for the content matching, but besides analyzing what topics the articles are talking about, we have machine learning algorithms that match you to the relevant suggested stuff. For example, if you shared an article about Zuck that got a good reaction from your followers, we might offer you another one about Kevin Systrom (just a simple example).\n";
textBody += "Who came up with the idea for Swayy, and why? And what's your business model?\n";
textBody += "Our business model is a subscription model for extra social accounts (extra Facebook / Twitter, etc) and team collaboration.\n";
textBody += "The idea was born from our day-to-day need to be active on social media, look for the best content to share with our followers, grow them, and measure what content works best.\n";
textBody += "Who is on the team?\n";
textBody += "Ohad Frankfurt is the CEO, Shlomi Babluki is the CTO and Oz Katz does Product and Engineering, and I [Lior Degani] do Marketing. The four of us are the founders. Oz and I were in 8200 [an elite Israeli army unit] together. Emily Engelson does Community Management and Graphic Design.\n";
textBody += "If you use Percolate or read LinkedIn's recommended posts I think you'll love Swayy.\n";
textBody += "Want to try Swayy out without having to wait? Go to this secret URL and enter the promotion code thenextweb . The first 300 people to use the code will get access.\n";
textBody += "Image credit: Thinkstock";

let initialSizeGlobal, reducedSizeGlobal, reductionPercentage;

establishTestSet('Text Reduction Evaluation', function() {
    conductVerification('should generate concise output and ensure different size', function(completeTest) {
        contentProcessor.shortenText(mainHeading, textBody, function(issue, condensedOutput) {
            if (issue) {
                trialOutcome.push({ description: 'Error during text shortening', passed: false, details: issue.message });
                completeTest();
                return;
            }

            initialSizeGlobal = mainHeading.length + textBody.length;
            reducedSizeGlobal = condensedOutput.length;
            reductionPercentage = (100 - (100 * (reducedSizeGlobal / (mainHeading.length + textBody.length))));

            assessType(condensedOutput, 'string', 'Condensed output should be a string');
            assessInequality(initialSizeGlobal, reducedSizeGlobal, 'Initial size should not equal reduced size');
            completeTest();
        });
    });
});

establishTestSet('Phrase Extraction Verification', function() {
    conductVerification('should retrieve specific number of ordered phrases', function(completeTest) {
        const desiredQuantity = 5;
        contentProcessor.extractOrderedPhrases(textBody, desiredQuantity, function(issue, orderedPhrases) {
            if (issue) {
                trialOutcome.push({ description: 'Error during phrase extraction', passed: false, details: issue.message });
                completeTest();
                return;
            }
            assessEquality(orderedPhrases.length, desiredQuantity, `Number of ordered phrases should be ${desiredQuantity}`);
            completeTest();
        });
    });
});