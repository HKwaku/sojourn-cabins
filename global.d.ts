declare module '*.js';

declare module '@/mailjet' {
  export function sendBookingEmail(args: {
    to: string;
    name: string;
    booking: Record<string, unknown>;
  }): Promise<unknown>;
  export function sendExtraSelectionsEmail(args: {
    to: string;
    name: string;
    booking: Record<string, unknown>;
    extrasLink: string;
  }): Promise<unknown>;
}
