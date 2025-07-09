import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  isToday, 
  isTomorrow, 
  isYesterday, 
  format, 
  differenceInDays, 
  startOfWeek, 
  endOfWeek,
  isSameWeek,
  addWeeks
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatSlotTime = (slot: string) => {
  const times: { [key: string]: string } = {
    lunch: "12-1pm",
    after_work: "5-7pm"
  };
  return times[slot] || slot;
};

export const formatChallengeSlot = (slotData: { date?: string; slot?: string }) => {
  if (!slotData?.date || !slotData?.slot) return "Time TBD";
  
  // Parse as local date to avoid timezone issues
  const date = new Date(slotData.date + 'T12:00:00');
  const time = formatSlotTime(slotData.slot);
  const now = getNowInLocalTz();
  const daysDiff = differenceInDays(date, now);
  
  // Handle explicit cases first
  if (isToday(date)) return `Today, ${time}`;
  if (isTomorrow(date)) return `Tomorrow, ${time}`;
  if (isYesterday(date)) return `Yesterday, ${time}`;
  
  // Current week (but not today/tomorrow/yesterday)
  if (isSameWeek(date, now, { weekStartsOn: 1 })) { // Monday start
    if (daysDiff > 0) {
      return `${format(date, 'EEEE')}, ${time}`; // "Wednesday, 12-1pm"
    } else {
      return `Last ${format(date, 'EEEE')}, ${time}`; // "Last Monday, 12-1pm"
    }
  }
  
  // Next week
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const nextWeekEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  
  if (date >= nextWeekStart && date <= nextWeekEnd) {
    return `Next ${format(date, 'EEEE')}, ${time}`; // "Next Friday, 5-7pm"
  }
  
  // Last week
  const lastWeekStart = startOfWeek(addWeeks(now, -1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(addWeeks(now, -1), { weekStartsOn: 1 });
  
  if (date >= lastWeekStart && date <= lastWeekEnd) {
    return `Last ${format(date, 'EEEE')}, ${time}`; // "Last Friday, 5-7pm"
  }
  
  // For dates beyond 1 week in either direction, use absolute format
  const isThisYear = format(date, 'yyyy') === format(now, 'yyyy');
  
  if (isThisYear) {
    return `${format(date, 'MMM d')}, ${time}`; // "Jan 15, 12-1pm"
  } else {
    return `${format(date, 'MMM d, yyyy')}, ${time}`; // "Jan 15, 2025, 12-1pm"
  }
};

/**
 * Creates a WhatsApp link to accept a ping pong league match for a specific time slot
 * @param phoneNumber - Phone number in international format (e.g., "+353833190717")
 * @param timeSlot - Formatted time slot (e.g., "Tomorrow, 12-1pm")
 * @param yourName - Your name to include in the message
 * @returns WhatsApp link with acceptance message
 */
export const acceptChallengeWhatsApp = (
  phoneNumber: string, 
  timeSlot: string,
  yourName: string
): string => {
  // Clean phone number - remove spaces, dashes, and + sign
  const cleanPhone = phoneNumber.replace(/[\s\-+]/g, '');
  
  const message = `Hey I'm ${yourName}, up for a ping pong league match ${timeSlot}? 🏓`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const getLocalTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getNowInLocalTz = (): Date => {
  // Get current time in user's local timezone as a Date object
  const timezone = getLocalTimezone();
  const localISOString = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  return new Date(localISOString);
};

export const getNowInLocalTzISO = (): string => {
  // Get current time as ISO string in local timezone for database storage
  const timezone = getLocalTimezone();
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

console.log('new date()-->', new Date().toISOString())
console.log('getNowInLocalTzISO()-->', getNowInLocalTzISO())
console.log('getNowInLocalTz()-->', getNowInLocalTz().toISOString())