function locateFamousGuest(relations) {
    const guestCount = relations.length;

    for (let suspect = 0; suspect < guestCount; suspect++) {
        let qualifies = true;

        for (let guest = 0; guest < guestCount; guest++) {
            if (guest === suspect) {
                continue;
            }

            if (
                relations[suspect][guest] ||
                !relations[guest][suspect]
            ) {
                qualifies = false;
                break;
            }
        }

        if (qualifies) {
            return suspect;
        }
    }

    return -1;
}

const relationships = [
    [false, true,  true,  false],
    [false, false, true,  false],
    [false, false, false, false],
    [true,  false, true,  false]
];

console.log(locateFamousGuest(relationships)); // 2