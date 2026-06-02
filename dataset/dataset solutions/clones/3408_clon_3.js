function processDate(dateString) {
  const RADIX_DECIMAL = 10;
  const dayValue = parseInt(dateString, RADIX_DECIMAL);

  const getHolidayMessage = (currentDay) => {
    const holidayMessagesMap = new Map();
    holidayMessagesMap.set(25, 'Christmas');
    holidayMessagesMap.set(24, 'Christmas Eve');
    holidayMessagesMap.set(23, 'Christmas Eve Eve');

    const message = holidayMessagesMap.get(currentDay);

    if (message !== undefined) {
      return message;
    } else {
      return 'Christmas Eve Eve Eve';
    }
  };

  const finalOutputMessage = getHolidayMessage(dayValue);
  console.log(finalOutputMessage);
}

processDate(require('fs').readFileSync('/dev/stdin', 'utf8'));
