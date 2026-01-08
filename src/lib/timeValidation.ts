/**
 * Time validation utilities for appointment video calls
 */

export interface TimeWindowStatus {
    canStartCall: boolean;
    status: 'too-early' | 'active' | 'expired';
    message: string;
    minutesUntilAvailable?: number;
    minutesUntilExpiry?: number;
}

// Configuration constants
const BEFORE_WINDOW_MINUTES = 15; // Allow call 15 minutes before appointment
const AFTER_WINDOW_MINUTES = 60;  // Allow call up to 60 minutes after appointment

/**
 * Check if current time is within the valid window for starting a video call
 * @param appointmentDate - The scheduled appointment date/time
 * @returns TimeWindowStatus object with call availability and status info
 */
export function getTimeWindowStatus(appointmentDate: string | Date): TimeWindowStatus {
    const now = new Date();
    const appointment = new Date(appointmentDate);

    // Debug logging
    console.log('=== Time Validation Debug ===');
    console.log('Current time:', now.toLocaleString());
    console.log('Appointment time:', appointment.toLocaleString());
    console.log('Appointment date input:', appointmentDate);

    // Calculate time differences in milliseconds
    const timeDiffMs = appointment.getTime() - now.getTime();
    const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

    console.log('Time difference (ms):', timeDiffMs);
    console.log('Time difference (minutes):', timeDiffMinutes);
    console.log('BEFORE_WINDOW:', BEFORE_WINDOW_MINUTES, 'AFTER_WINDOW:', AFTER_WINDOW_MINUTES);

    // Check if appointment is in the past
    const minutesSinceAppointment = -timeDiffMinutes;

    // Too early - more than BEFORE_WINDOW_MINUTES before appointment
    if (timeDiffMinutes > BEFORE_WINDOW_MINUTES) {
        console.log('Status: TOO EARLY');
        console.log('===========================\n');
        return {
            canStartCall: false,
            status: 'too-early',
            message: `Available in ${timeDiffMinutes} minutes`,
            minutesUntilAvailable: timeDiffMinutes - BEFORE_WINDOW_MINUTES,
        };
    }

    // Active window - within BEFORE_WINDOW_MINUTES before to AFTER_WINDOW_MINUTES after
    if (timeDiffMinutes >= -AFTER_WINDOW_MINUTES && timeDiffMinutes <= BEFORE_WINDOW_MINUTES) {
        const minutesRemaining = AFTER_WINDOW_MINUTES + timeDiffMinutes;
        console.log('Status: ACTIVE');
        console.log('Minutes remaining in window:', minutesRemaining);
        console.log('===========================\n');
        return {
            canStartCall: true,
            status: 'active',
            message: 'Start Video Call',
            minutesUntilExpiry: minutesRemaining > 0 ? minutesRemaining : 0,
        };
    }

    // Expired - more than AFTER_WINDOW_MINUTES after appointment
    console.log('Status: EXPIRED');
    console.log('Minutes since appointment:', minutesSinceAppointment);
    console.log('===========================\n');
    return {
        canStartCall: false,
        status: 'expired',
        message: 'Appointment ended',
    };
}

/**
 * Format a date/time for display
 * @param date - The date to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatAppointmentTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format time remaining into a readable string
 * @param minutes - Number of minutes
 * @returns Formatted string (e.g., "1h 30m" or "25m")
 */
export function formatTimeRemaining(minutes: number): string {
    if (minutes < 0) {
        return '0m';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return `${mins}m`;
}

/**
 * Check if appointment is today
 * @param date - The date to check
 * @returns True if appointment is today
 */
export function isToday(date: string | Date): boolean {
    const today = new Date();
    const appointmentDate = new Date(date);

    return (
        today.getFullYear() === appointmentDate.getFullYear() &&
        today.getMonth() === appointmentDate.getMonth() &&
        today.getDate() === appointmentDate.getDate()
    );
}
