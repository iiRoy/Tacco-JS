const processScheduleData = (incomingText) => {
  const [
    startH,
    startM,
    endH,
    endM,
    deduction
  ] = incomingText.split('\n')[0].split(' ').map(Number);

  const convertToMinutes = (hoursComponent, minutesComponent) =>
    (hoursComponent * 60) + minutesComponent;

  const initialPoint = convertToMinutes(startH, startM);
  const finalPoint = convertToMinutes(endH, endM);

  const durationDifference = finalPoint - initialPoint - deduction;

  console.log(durationDifference);
};