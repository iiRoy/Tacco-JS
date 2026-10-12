function findCelebrity(knows)
{
    const totalPeople =
        knows.length;

    // Probar a cada invitado
    for(
        let candidate = 0;
        candidate < totalPeople;
        candidate++
    )
    {
        let isCelebrity = true;

        for(
            let person = 0;
            person < totalPeople;
            person++
        )
        {
            if(person === candidate)
            {
                continue;
            }

            // Verificar las dos condiciones
            if(
                knows[candidate][person] ||
                !knows[person][candidate]
            )
            {
                isCelebrity = false;
                break;
            }
        }

        if(isCelebrity)
        {
            return candidate;
        }
    }

    return -1;
}

const party =
[
    [false, true,  true,  false],
    [false, false, true,  false],
    [false, false, false, false],
    [true,  false, true,  false]
];

console.log(
    findCelebrity(party)
); // 2