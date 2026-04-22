function retrievePeopleData() {
    const dataSequence = "Smith|Mary;Johnson|Patricia;Williams|Linda;Brown|Barbara;Jones|Elizabeth;Miller|Jennifer;Davis|Maria;Garcia|Susan;Rodriguez|Margaret;Wilson|Dorothy;Martinez|Lisa;Anderson|Nancy;Taylor|Karen;Thomas|Betty;Hernandez|Helen;Moore|Sandra;Martin|Donna;Jackson|Carol;Thompson|Ruth;White|Sharon;Lopez|Michelle;Lee|Laura;Gonzalez|Sarah;Harris|Kimberly;Clark|Deborah;Lewis|Jessica;Robinson|Shirley;Walker|Cynthia;Perez|Angela;Hall|Melissa;Young|Brenda;Allen|Amy;Sanchez|Anna;Wright|Rebecca;King|Virginia;Scott|Kathleen;Green|Pamela;Baker|Martha";

    const individualEntries = dataSequence.split(';');

    return individualEntries.map(entryString => {
        const nameComponents = entryString.split('|');
        return {
            primaryIdentifier: nameComponents[0],
            secondaryIdentifier: nameComponents[1]
        };
    });
}