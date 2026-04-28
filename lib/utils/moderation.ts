// lib/utils/moderation.ts

export type ModerationSeverity = "low" | "medium" | "high";

export type ModerationIssueType =
  | "email"
  | "phone"
  | "possible_address"
  | "real_name_request"
  | "threat"
  | "blackmail"
  | "hate_or_slur"
  | "graphic_sexual_content"
  | "self_harm"
  | "spam"
  | "too_many_identifiers";

export type ModerationIssue = {
  type: ModerationIssueType;
  severity: ModerationSeverity;
  message: string;
};

export type ModerationResult = {
  allowed: boolean;
  shouldFlag: boolean;
  issues: ModerationIssue[];
  supportiveNotice: string | null;
};

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const phonePattern =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/;

const possibleAddressPattern =
  /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd|way|place|pl)\b/i;

const realNameRequestPattern =
  /\b(?:his name is|her name is|their name is|my boss|my teacher|my coworker|my classmate|at my school|at my company)\b/i;

const threatPattern =
  /\b(?:i will kill|i'm going to kill|i am going to kill|hurt them|make them pay|they deserve to die|burn their house|beat them up)\b/i;

const blackmailPattern =
  /\b(?:blackmail|leak their|expose them|ruin their life|post their photos|share their secrets|revenge)\b/i;

const graphicSexualPattern =
  /\b(?:rape|explicit photos|nudes|sexual assault|molest|incest)\b/i;

const selfHarmPattern =
  /\b(?:kill myself|end my life|suicide|self harm|self-harm|hurt myself|i want to die|not be alive)\b/i;

const spamPattern =
  /\b(?:free money|crypto giveaway|click here|promo code|make \$\d+|work from home scam)\b/i;

const hateOrSlurTerms = [
  "nazi",
  "racial slur",
  "homophobic slur",
  "transphobic slur",
  "kill all",
  "go back to your country"
] as const;

const supportiveSelfHarmNotice =
  "If this confession involves immediate danger or thoughts of self-harm, consider contacting local emergency services or a trusted crisis support line now. You deserve real support from someone who can help you stay safe.";

function countMatches(patterns: ReadonlyArray<RegExp>, text: string): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function containsHateOrSlur(text: string): boolean {
  const normalizedText = text.toLowerCase();

  return hateOrSlurTerms.some((term) => normalizedText.includes(term));
}

function createIssue(
  type: ModerationIssueType,
  severity: ModerationSeverity,
  message: string
): ModerationIssue {
  return {
    type,
    severity,
    message
  };
}

export function moderateConfessionText(text: string): ModerationResult {
  const normalizedText = text.trim();
  const issues: ModerationIssue[] = [];

  if (emailPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "email",
        "high",
        "Remove email addresses to keep the confession anonymous."
      )
    );
  }

  if (phonePattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "phone",
        "high",
        "Remove phone numbers to keep people private."
      )
    );
  }

  if (possibleAddressPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "possible_address",
        "high",
        "Remove addresses or location details that could identify someone."
      )
    );
  }

  if (realNameRequestPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "real_name_request",
        "medium",
        "Avoid names, workplaces, schools, or details that identify real people."
      )
    );
  }

  if (threatPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "threat",
        "high",
        "Threats or violence are not allowed."
      )
    );
  }

  if (blackmailPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "blackmail",
        "high",
        "Revenge posting, blackmail, or exposing others is not allowed."
      )
    );
  }

  if (containsHateOrSlur(normalizedText)) {
    issues.push(
      createIssue(
        "hate_or_slur",
        "high",
        "Hate or discriminatory content is not allowed."
      )
    );
  }

  if (graphicSexualPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "graphic_sexual_content",
        "medium",
        "Graphic sexual content may be restricted or sent for review."
      )
    );
  }

  if (selfHarmPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "self_harm",
        "medium",
        "Self-harm related content may need supportive resources or review."
      )
    );
  }

  if (spamPattern.test(normalizedText)) {
    issues.push(
      createIssue(
        "spam",
        "high",
        "Spam or promotional content is not allowed."
      )
    );
  }

  const identifierCount = countMatches(
    [emailPattern, phonePattern, possibleAddressPattern, realNameRequestPattern],
    normalizedText
  );

  if (identifierCount >= 2) {
    issues.push(
      createIssue(
        "too_many_identifiers",
        "high",
        "This confession contains too many identifying details."
      )
    );
  }

  const hasHighSeverityIssue = issues.some((issue) => issue.severity === "high");
  const hasMediumSeverityIssue = issues.some((issue) => issue.severity === "medium");
  const hasSelfHarmIssue = issues.some((issue) => issue.type === "self_harm");

  return {
    allowed: !hasHighSeverityIssue,
    shouldFlag: hasHighSeverityIssue || hasMediumSeverityIssue,
    issues,
    supportiveNotice: hasSelfHarmIssue ? supportiveSelfHarmNotice : null
  };
}

export function hasHoneypotValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function normalizeModerationTextParts(parts: ReadonlyArray<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n");
}