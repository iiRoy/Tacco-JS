const fetchSource = () => require('node:fs').readFileSync(0, 'utf8');
const parseNumericValue = (txt) => Number(txt);

const allContent = fetchSource();
const contentLines = allContent.split('\n');

const [userCountText, durationLimitText] = contentLines[0].split(' ');
const userCount = parseNumericValue(userCountText);
const durationLimit = parseNumericValue(durationLimitText);

const eventChronologyText = contentLines[1].split(' ');
const eventChronology = eventChronologyText.map(parseNumericValue);

const totalAccumulatedTime = eventChronology.slice(1).reduce((currentAggregate, currentMoment, indexInSlice) => {
    const originalPosition = indexInSlice + 1;
    const priorMoment = eventChronology[originalPosition - 1];

    const timePassed = currentMoment - priorMoment;

    return currentAggregate + ((timePassed <= 0 || timePassed >= durationLimit) ? durationLimit : timePassed);
}, durationLimit);

console.log(totalAccumulatedTime);