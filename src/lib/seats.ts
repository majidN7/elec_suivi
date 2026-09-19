const SIEGES_PAR_LISTE = {
  LOCALE: 3,
  REGIONALE: 2,
} as const;

export function siegesPourListe(typeListe: keyof typeof SIEGES_PAR_LISTE): number {
  return SIEGES_PAR_LISTE[typeListe];
}

export function quotientElectoral(totalInscrits: number, totalSieges: number): number {
  return totalSieges > 0 ? totalInscrits / totalSieges : 0;
}

/**
 * Répartition des sièges par quotient électoral puis plus forte moyenne,
 * conformément au mode de scrutin des élections locales/régionales.
 */
export function repartirSieges<T extends { id: string; voix: number }>(
  partis: T[],
  quotient: number,
  totalSieges: number,
): Map<string, number> {
  const sieges = new Map(partis.map((p) => [p.id, 0]));
  if (quotient <= 0 || totalSieges <= 0) return sieges;

  for (const p of partis) {
    sieges.set(p.id, Math.floor(p.voix / quotient));
  }

  const attribues = Array.from(sieges.values()).reduce((a, b) => a + b, 0);
  let restants = totalSieges - attribues;

  while (restants > 0) {
    let meilleurId: string | null = null;
    let meilleureMoyenne = -1;
    for (const p of partis) {
      const siegesActuels = sieges.get(p.id) ?? 0;
      const moyenne = p.voix / (siegesActuels + 1);
      if (moyenne > meilleureMoyenne) {
        meilleureMoyenne = moyenne;
        meilleurId = p.id;
      }
    }
    if (meilleurId === null) break;
    sieges.set(meilleurId, (sieges.get(meilleurId) ?? 0) + 1);
    restants -= 1;
  }

  return sieges;
}
