import type { IssueAuthorityResponse, IssueDetailResponse } from '@/types/issues';
import { formatDateRomanian } from '@/utils/format-date-romanian';

type BuildMailtoParams = {
  authority: IssueAuthorityResponse;
  issue: IssueDetailResponse;
};

export type EmailParts = {
  to: string;
  subject: string;
  body: string;
};

/**
 * Build a legally-compliant petition email per Romanian OG 27/2002.
 * Contains placeholder brackets the user must fill in their email client.
 */
export function buildEmailParts({ authority, issue }: BuildMailtoParams): EmailParts {
  const to = authority.email ?? '';

  const subject = `Petiție - [NUMELE TĂU COMPLET] - ${issue.title ?? ''}`;

  const locationParts = [issue.address];
  if (issue.district) locationParts.push(issue.district);
  const locationString = locationParts.filter(Boolean).join(', ') || 'Locație nespecificată';

  const createdDate = formatDateRomanian(issue.createdAt);
  const currentDate = formatDateRomanian(new Date().toISOString());

  const communityImpactSection = issue.communityImpact?.trim()
    ? `\n${issue.communityImpact.trim()}`
    : '';

  const desiredOutcomeText = issue.desiredOutcome?.trim()
    ? issue.desiredOutcome.trim()
    : 'Vă solicit să luați măsurile necesare pentru remedierea acestei probleme în cel mai scurt timp posibil.';

  const photoCount = issue.photos?.length ?? 0;
  const photosSection =
    photoCount > 0
      ? `La prezenta petiție anexez ${photoCount} ${photoCount === 1 ? 'fotografie care documentează' : 'fotografii care documentează'} problema semnalată.\n`
      : '';

  const authorityName = authority.name ?? 'Autoritate';

  const body = `Către: ${authorityName}

Subsemnatul/a [NUMELE TĂU COMPLET], CNP: [CNP-UL TĂU], domiciliat(ă) în [ADRESA TA DE DOMICILIU], email: [ADRESA TA DE EMAIL], telefon: [NUMĂRUL TĂU DE TELEFON], vă adresez prezenta petiție prin care solicit să luați măsuri în legătură cu următoarea problemă:

${issue.title ?? ''}

Locație: ${locationString}
Data sesizării: ${createdDate}

${issue.description ?? ''}${communityImpactSection}

${desiredOutcomeText}

${photosSection}Link către documentația completă: https://civiti.ro/issues/${issue.id}

Conform O.G. 27/2002 privind reglementarea activității de soluționare a petițiilor, vă rog să îmi comunicați răspunsul la adresa de domiciliu menționată mai sus sau prin email la [ADRESA TA DE EMAIL], în termenul legal de 30 de zile.

De asemenea, vă rog să îmi comunicați numărul de înregistrare al acestei petiții pe adresa de email menționată mai sus, pentru a putea urmări soluționarea acesteia.

Cu stimă,
[NUMELE TĂU COMPLET]
${currentDate}`;

  return { to, subject, body };
}
