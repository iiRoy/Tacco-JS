const completeContentRepository = [
    "The Wolverine", "The Smurfs 2", "The Mortal Instruments: City of Bones", "Drinking Buddies", "All the Boys Love Mandy Lane", "The Act Of Killing", "Red 2", "Jobs", "Getaway", "Red Obsession", "2 Guns", "The World's End", "Planes", "Paranoia", "The To Do List", "Man of Steel", "The Way Way Back", "Before Midnight", "Only God Forgives", "I Give It a Year", "The Heat", "Pacific Rim", "Pacific Rim", "Kevin Hart: Let Me Explain", "A Hijacking", "Maniac", "After Earth", "The Purge", "Much Ado About Nothing", "Europa Report", "Stuck in Love", "We Steal Secrets: The Story Of Wikileaks", "The Croods", "This Is the End", "The Frozen Ground", "Turbo", "Blackfish", "Frances Ha", "Prince Avalanche", "The Attack", "Grown Ups 2", "White House Down", "Lovelace", "Girl Most Likely", "Parkland", "Passion", "Monsters University", "R.I.P.D.", "Byzantium", "The Conjuring", "The Internship"
];

const ContentProvider = {
    obtainContent: function(queryCriterion) {
        return new Promise(fulfill => {
            setTimeout(() => {
                const resultingContent = completeContentRepository;
                fulfill(resultingContent);
            }, 1000);
        });
    }
};

function InterfaceHandler(contentSource) {
    const presentationState = {
        displayedItems: [],
        updatedItemsPromise: null
    };

    contentSource.obtainContent("initial_load_param").then(retrievedData => {
        presentationState.displayedItems = retrievedData;
    });

    const retrieveCurrentlyDisplayed = function() {
        return presentationState.displayedItems;
    };

    const processUserTextEntry = function(inputStringValue) {
        console.log("Action: Refreshing data based on input: " + inputStringValue);
        presentationState.updatedItemsPromise = contentSource.obtainContent(inputStringValue);
        presentationState.updatedItemsPromise.then(freshData => {
            presentationState.displayedItems = freshData;
        });
    };

    const respondToChoiceMade = function(selectedEntryValue) {
        console.log("Choice registered: " + selectedEntryValue);
    };

    return {
        viewData: presentationState,
        getCurrentDisplay: retrieveCurrentlyDisplayed,
        handleUserText: processUserTextEntry,
        handleUserChoice: respondToChoiceMade
    };
}