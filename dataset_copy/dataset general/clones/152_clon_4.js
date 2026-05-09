const dataPayload = [
    ["TOGGLE_BOOKMARK", "Créer/supprimer le marque-page"],
    ["GOTO_NEXT_BOOKMARK", "Marque-page suivant"],
    ["GOTO_PREV_BOOKMARK", "Marque-page précédent"],
    ["TOGGLE_BOOKMARKS_PANEL", "Afficher panneau des marque-pages"],
    ["BOOKMARKS_PANEL_TITLE", "Marque-pages"]
];

const constructedEntity = dataPayload.reduce((collectionAccumulator, currentPair) => {
    const [keyComponent, valueComponent] = currentPair;
    collectionAccumulator[keyComponent] = valueComponent;
    return collectionAccumulator;
}, {});

export default constructedEntity;