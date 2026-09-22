const SIEGES_PAR_LISTE = {
  LOCALE: 2,
  REGIONALE: 3,
} as const;

export function siegesPourListe(typeListe: keyof typeof SIEGES_PAR_LISTE): number {
  return SIEGES_PAR_LISTE[typeListe];
}

export function quotientElectoral(totalInscrits: number, totalSieges: number): number {
  return totalSieges > 0 ? totalInscrits / totalSieges : 0;
}

/**
 * Voix exprimées (VE = Votants − Bulletins nuls) et contrôle de cohérence
 * face à la somme des voix par parti réellement saisies/importées en base.
 * Source de vérité unique pour ce calcul (dashboard + tests).
 */
export function calculerCoherenceVoix(
  totalVotants: number,
  totalVotesRejetes: number,
  sommeVoixPartis: number,
) {
  const votesExprimes = totalVotants - totalVotesRejetes;
  const ecart = Math.abs(votesExprimes - sommeVoixPartis);
  const conforme = votesExprimes === sommeVoixPartis;
  return { votesExprimes, sommeVoixPartis, ecart, conforme };
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
