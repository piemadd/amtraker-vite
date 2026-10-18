import { m } from "../../paraglide/messages.js";
export const hoursMinutesDaysDuration = (durationMinutesRaw = 0) => {
  const minutes = durationMinutesRaw;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let finalString = '';

  if (minutes < 1 && hours < 1) return m["common_strings.time.minutes_short"]({ minutes: 0 });
  if (days > 0) finalString += `${m["common_strings.time.days_short"]({ days })} `;
  if (hours % 24 > 0 || days > 0) finalString += `${m["common_strings.time.hours_short"]({ hours: hours % 24 })} `;
  if (minutes % 60 > 0 || days > 0) finalString += m["common_strings.time.minutes_short"]({ minutes: minutes % 60 });

  return finalString.trim();
};

export const dateToYYYYMM = (date) => {
  const yearFull = date.getUTCFullYear();
  const monthFull = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${yearFull}-${monthFull}`;
};

export const dateToYYYYMMDD = (date) => {
  const yearFull = date.getUTCFullYear();
  const monthFull = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dateFull = (date.getUTCDate()).toString().padStart(2, '0');
  return `${yearFull}-${monthFull}-${dateFull}`;
};