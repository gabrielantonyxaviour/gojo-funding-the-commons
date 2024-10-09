import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formattedNumber(num: number): string {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "m";
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.?0+$/, "") + "k";
  } else {
    return num.toString();
  }
}
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
