import { z } from "zod";

export const lieuDeVoteSchema = z.object({
  code: z.string().trim().min(1, "Le code est requis").max(50),
  nom: z.string().trim().min(1, "Le nom est requis").max(200),
  adresse: z.string().trim().max(300).optional().or(z.literal("")),
});

export const bureauVoteSchema = z.object({
  code: z.string().trim().min(1, "Le code est requis").max(50),
  nom: z.string().trim().min(1, "Le nom est requis").max(200),
  lieuDeVoteId: z.string().trim().min(1, "Le lieu de vote est requis"),
  inscrits: z.coerce.number().int().min(0).optional().nullable(),
});

export const partiPolitiqueSchema = z.object({
  code: z.string().trim().min(1, "Le code est requis").max(50),
  nom: z.string().trim().min(1, "Le nom est requis").max(200),
  couleur: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #RRGGBB)")
    .optional()
    .or(z.literal("")),
});

export const userSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  role: z.enum(["ADMIN_NATIONAL", "AGENT_SAISIE"]),
  actif: z.coerce.boolean().default(true),
});

export const userCreateSchema = userSchema.extend({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const resultatSchema = z
  .object({
    bureauVoteId: z.string().min(1),
    typeListe: z.enum(["LOCALE", "REGIONALE"]),
    totalVotants: z.coerce.number().int().min(0, "Doit être positif"),
    votesRejetes: z.coerce.number().int().min(0, "Doit être positif"),
    voix: z.array(
      z.object({
        partiId: z.string().min(1),
        voix: z.coerce.number().int().min(0, "Doit être positif"),
      }),
    ),
  })
  .refine(
    (data) => {
      const sommeVoix = data.voix.reduce((acc, v) => acc + v.voix, 0);
      return sommeVoix + data.votesRejetes === data.totalVotants;
    },
    {
      message:
        "Le total des votants doit être égal à la somme des voix par parti plus les votes rejetés",
      path: ["totalVotants"],
    },
  );

export const unlockRequestSchema = z.object({
  resultatId: z.string().min(1),
  motif: z.string().trim().min(5, "Merci de préciser le motif (5 caractères min.)").max(500),
});

export const unlockDecisionSchema = z.object({
  unlockRequestId: z.string().min(1),
  decision: z.enum(["APPROUVEE", "REJETEE"]),
  motifTraite: z.string().trim().max(500).optional().or(z.literal("")),
});
