import { Localization } from '@/constants/localization';
import type { IssueAuthorityResponse, IssueDetailResponse } from '@/types/issues';

type BuildMailtoParams = {
  authority: IssueAuthorityResponse;
  issue: IssueDetailResponse;
  userName: string | null;
};

export type EmailParts = {
  to: string;
  subject: string;
  body: string;
};

export function buildEmailParts({ authority, issue, userName }: BuildMailtoParams): EmailParts {
  const to = authority.email ?? '';
  const district = issue.district ?? 'București';

  const subject = `[URGENT] Sesizare cetățenească - ${issue.title ?? ''} - ${district}, București`;

  const categoryLabel =
    Localization.category[issue.category as keyof typeof Localization.category] ?? issue.category;
  const urgencyLabel =
    Localization.urgency[issue.urgency as keyof typeof Localization.urgency] ?? issue.urgency;

  const lines: string[] = [
    `Stimată ${authority.name ?? 'autoritate'},`,
    '',
    'Vă scriu pentru a vă aduce la cunoștință o problemă comunitară care necesită atenția dumneavoastră.',
    '',
    'Detalii problemă:',
    `- Titlu: ${issue.title ?? ''}`,
    `- Locație: ${issue.address ?? ''}`,
    `- Categorie: ${categoryLabel}`,
    `- Urgență: ${urgencyLabel}`,
    '',
    'Descriere:',
    issue.description ?? '',
  ];

  if (issue.desiredOutcome) {
    lines.push('', 'Rezultat dorit:', issue.desiredOutcome);
  }

  if (issue.communityImpact) {
    lines.push('', 'Impact asupra comunității:', issue.communityImpact);
  }

  const parsedDate = new Date(issue.createdAt);
  const createdDate = Number.isNaN(parsedDate.getTime())
    ? issue.createdAt
    : parsedDate.toLocaleDateString('ro-RO');

  lines.push(
    '',
    `Această problemă a fost raportată pe ${createdDate}${issue.emailsSent > 0 ? ` și a fost deja semnalată de ${issue.emailsSent} cetățeni` : ''}.`,
    '',
    'Vă rog să interveniți pentru rezolvarea acestei situații.',
    '',
    'Cu stimă,',
    userName ?? 'Un cetățean',
    '',
    '---',
    `Referință: ${issue.id}`,
    'Trimis prin platforma Civiti',
  );

  const body = lines.join('\n');

  return { to, subject, body };
}

/** @deprecated Use buildEmailParts + openComposer instead */
export function buildMailto(params: BuildMailtoParams): string {
  const { to, subject, body } = buildEmailParts(params);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
