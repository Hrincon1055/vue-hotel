// Helpers para formatear datos
export const capitalize = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
