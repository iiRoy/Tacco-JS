function ProcessInput(rawData) {
    const lineSegments = rawData.split("\n");
    const dimensions = lineSegments[0].split(" ");
    const personCount = parseInt(dimensions[0], 10);
    const itemCount = parseInt(dimensions[1], 10);

    const individualPreferences = [];

    for (let currentPersonIdx = 1; currentPersonIdx <= personCount; currentPersonIdx++) {
        const personData = lineSegments[currentPersonIdx].split(" ");
        const itemsLikedByPerson = new Set();
        
        // The first element in personData is the count of items this person likes.
        // We iterate from the second element (index 1) up to that count.
        for (let itemDataIdx = 1; itemDataIdx <= parseInt(personData[0], 10); itemDataIdx++) {
            itemsLikedByPerson.add(parseInt(personData[itemDataIdx], 10));
        }
        individualPreferences.push(itemsLikedByPerson);
    }

    let universallyLikedItemCount = 0;

    // Iterate through each potential menu item from 1 to itemCount
    for (let candidateItem = 1; candidateItem <= itemCount; candidateItem++) {
        // Check if every person in the individualPreferences array likes the current candidateItem
        const isUniversallyLiked = individualPreferences.every(personSet => 
            personSet.has(candidateItem)
        );

        if (isUniversallyLiked) {
            universallyLikedItemCount++;
        }
    }

    console.log(universallyLikedItemCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
