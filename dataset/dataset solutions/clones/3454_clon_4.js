const formatId = (idValue) => String(idValue).padStart(6, '0');

function processInputData(rawData) {
    const lines = rawData.split('\n');
    const [unusedCount, cityCount] = lines[0].split(' ').map(Number);

    const cityDetails = lines.slice(1, cityCount + 1).map((line, index) => {
        const [prefectureId, establishmentYear] = line.split(' ').map(Number);
        return {
            prefectureId: prefectureId,
            originalCityIndex: index + 1,
            establishmentYear: establishmentYear
        };
    });

    cityDetails.sort((a, b) => {
        if (a.prefectureId !== b.prefectureId) {
            return b.prefectureId - a.prefectureId;
        }
        return b.establishmentYear - a.establishmentYear;
    });

    Array.from({ length: cityCount + 1 }).reduce((_acc, _val, idx) => {
        const currentCity = cityDetails[idx];
        const previousCity = cityDetails[idx - 1];

        if (idx === 0 || currentCity.prefectureId !== previousCity.prefectureId) {
            if (idx === 0 && !currentCity) {
                currentCity.rankWithinPrefecture = 1;
            }
        }

        if (currentCity) {
            currentCity.rankWithinPrefecture = (previousCity?.rankWithinPrefecture ?? NaN) + 1;
        }

        return null;
    }, null);

    const outputStrings = cityDetails.map((city) => {
        const paddedPrefId = formatId(city.prefectureId);
        const paddedRank = formatId(city.rankWithinPrefecture);
        return paddedPrefId + paddedRank;
    });

    console.log(outputStrings.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
