import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const dateFrom = (date: string) => {
  const minutesInHours = 60;
  const hoursInADay = 24;
  const hoursAgo = dayjs().diff(date, 'hour');
  const guestTimezoneHour = dayjs().utcOffset() / minutesInHours;
  const currentDate = dayjs(date).hour(dayjs(date).hour() + guestTimezoneHour);

  if (hoursAgo >= hoursInADay) {
    return dayjs(currentDate).format('hh:mm • MM/DD/YYYY');
  }

  return dayjs(currentDate).fromNow();
};
