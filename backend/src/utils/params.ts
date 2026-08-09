/**
 * Extrae un parámetro de ruta de forma segura.
 * Express 5 puede tipar los params como string | string[].
 */
export const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};
