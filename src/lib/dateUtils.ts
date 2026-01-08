/**
 * Date utility functions for IST (Indian Standard Time) formatting
 */

// IST timezone
const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format date to IST with full date details
 */
export const formatDateIST = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(dateString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: IST_TIMEZONE,
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

/**
 * Format date to IST - short format (e.g., "Jan 8")
 */
export const formatDateShortIST = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        timeZone: IST_TIMEZONE,
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format time to IST (e.g., "10:30 AM")
 */
export const formatTimeIST = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
        timeZone: IST_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date and time to IST
 */
export const formatDateTimeIST = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        timeZone: IST_TIMEZONE,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export const formatTime12Hour = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get current date in IST as YYYY-MM-DD for input fields
 */
export const getCurrentDateIST = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE }); // en-CA gives YYYY-MM-DD format
};

/**
 * Get tomorrow's date in IST as YYYY-MM-DD for input fields
 */
export const getTomorrowDateIST = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE });
};
