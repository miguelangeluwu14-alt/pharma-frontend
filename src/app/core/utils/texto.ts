/** Pasa a minúsculas y quita tildes. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Comprueba si todas las palabras buscadas aparecen en los campos. */
export function coincide(busqueda: string, ...campos: string[]): boolean {
  const palabras = normalizar(busqueda)
    .split(/\s+/)
    .filter(Boolean);

  const texto = normalizar(campos.join(' '));

  return palabras.every(p => texto.includes(p));
}