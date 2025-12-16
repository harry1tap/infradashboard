import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getResponseTimeStatus = (createdAt: string, lastContact: string | null) => {
  if (lastContact) return 'responded';
  
  const diffInMinutes = (new Date().getTime() - new Date(createdAt).getTime()) / 60000;
  
  if (diffInMinutes < 5) return 'fresh';
  if (diffInMinutes < 30) return 'warning';
  return 'critical';
};

export const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as any).message;
  }
  if (typeof error === 'object' && error !== null && 'error_description' in error) {
    return (error as any).error_description;
  }
  return String(error);
};