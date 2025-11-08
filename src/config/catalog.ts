// Central catalog for all subject/school/month/tariff combinations
// Generated programmatically so every branch has its own photo, price, text, and pay URL.

export type SubjectKey =
  | "russian"
  | "math"
  | "baseMath"
  | "history"
  | "chemistry"
  | "english"
  | "physics"
  | "informatics"
  | "biology"
  | "social"
  | "literature";

export type SchoolKey = "100b" | "umskul_ege" | "egeland" | "kuplay";

export type MonthKey =
  | "september"
  | "october"
  | "november"
  | "december"
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "full_course";

export type Tariff = "standart" | "premium";

export interface CatalogEntry {
  key: string;
  subjectKey: SubjectKey;
  subjectName: string;
  schoolKey: SchoolKey;
  schoolName: string;
  monthKey: MonthKey;
  monthName: string;
  tariff: Tariff;
  price: number;
  text: string;
  photoUrl?: string;
  payUrl: string;
}

export const displayNames = {
  subjects: {
    russian: "Русский",
    math: "Математика",
    baseMath: "Базовая математика",
    history: "История",
    chemistry: "Химия",
    english: "Английский язык",
    physics: "Физика",
    informatics: "Информатика",
    biology: "Биология",
    social: "Обществознание",
    literature: "Литература",
  } as const satisfies Record<SubjectKey, string>,
  schools: {
    "100b": "100Б",
    umskul_ege: "Умскул",
    egeland: "ЕГЭЛЕНД",
    kuplay: "Кудлай",
  } as const satisfies Record<SchoolKey, string>,
  months: {
    september: "Сентябрь",
    october: "Октябрь",
    november: "Ноябрь",
    december: "Декабрь",
    january: "Январь",
    february: "Февраль",
    march: "Март",
    april: "Апрель",
    may: "Май",
    full_course: "Весь курс",
  } as const satisfies Record<MonthKey, string>,
  tariffs: {
    standart: "Standart",
    premium: "Premium",
  } as const satisfies Record<Tariff, string>,
};

export function buildKey(
  subject: SubjectKey,
  school: SchoolKey,
  month: MonthKey,
  tariff: Tariff
): string {
  return `${subject}_${school}_${month}_${tariff}`;
}

function defaultPrice(month: MonthKey, tariff: Tariff): number {
  const monthly = tariff === "standart" ? 800 : 1200;
  const full = tariff === "standart" ? 7480 : 8700;
  return month === "full_course" ? full : monthly;
}

function defaultText(
  subjectName: string,
  schoolName: string,
  monthName: string,
  tariff: Tariff,
  price: number
): string {
  const lines = [
    `${subjectName} — ${schoolName}`,
    monthName === "Весь курс" ? "Покупка полного курса" : `Месяц: ${monthName}`,
    `Тариф: ${displayNames.tariffs[tariff]}`,
    `Цена: ${price} ₽`,
    "",
    "Годовой курс — это твоя возможность подготовиться с нуля до максимальных баллов к ЕГЭ",
    "— 8-12 онлайн-занятий в месяц с преподом курса",
    "— Записи всех онлайн-занятий",
    "— Дополнительные материалы (шпоры, конспекты и другое)",
    "— Пробники формата экзамена",
    "— Домашние задания после каждого урока",
  ];
  return lines.join("\n");
}

const subjects: SubjectKey[] = [
  "russian",
  "math",
  "baseMath",
  "history",
  "chemistry",
  "english",
  "physics",
  "informatics",
  "biology",
  "social",
  "literature",
];

const schools: SchoolKey[] = ["100b", "umskul_ege", "egeland", "kuplay"];

// Разрешённые онлайн-школы по предметам
export const allowedSchoolsBySubject: Record<SubjectKey, SchoolKey[]> = {
  russian: ["100b", "umskul_ege", "egeland", "kuplay"],
  math: ["100b", "umskul_ege"],
  baseMath: ["100b", "umskul_ege"],
  history: ["100b", "umskul_ege"],
  chemistry: ["100b", "umskul_ege"],
  english: ["100b", "egeland"],
  physics: ["100b"],
  informatics: ["100b", "umskul_ege"],
  biology: ["100b", "umskul_ege"],
  social: ["100b", "umskul_ege", "egeland", "kuplay"],
  literature: ["100b", "egeland"],
};

const months: MonthKey[] = [
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
  "april",
  "may",
  "full_course",
];

const tariffs: Tariff[] = ["standart", "premium"];

export const catalog: Record<string, CatalogEntry> = {};

// Example mappings for different photos per option (final message)
// - subjectPhoto: legacy fallback per subject (kept for reference)
// - photoOverrides: exact per-combination image (subject+school+month+tariff)
// By default we now generate a unique image per subject+school+month
// using a deterministic seed, so photos differ by school, month и предмет.
// Replace with your real links (can be HTTP(S) URLs or Telegram file_id)
const subjectPhoto: Partial<Record<SubjectKey, string>> = {
  russian: "https://picsum.photos/seed/russian/800/600",
  math: "https://picsum.photos/seed/math/800/600",
  baseMath: "https://picsum.photos/seed/baseMath/800/600",
  history: "https://picsum.photos/seed/history/800/600",
  chemistry: "https://picsum.photos/seed/chemistry/800/600",
  english: "https://picsum.photos/seed/english/800/600",
  physics: "https://picsum.photos/seed/physics/800/600",
  informatics: "https://picsum.photos/seed/informatics/800/600",
  biology: "https://picsum.photos/seed/biology/800/600",
  social: "https://picsum.photos/seed/social/800/600",
  literature: "https://picsum.photos/seed/literature/800/600",
};

const photoOverrides: Partial<Record<string, string>> = {
  // Exact combination examples
  [buildKey("math", "100b", "september", "standart")]:
    "https://picsum.photos/seed/math-100b-sep-std/800/600",
  [buildKey("russian", "umskul_ege", "full_course", "premium")]:
    "https://picsum.photos/seed/rus-umskul-full-prem/800/600",
  [buildKey("english", "egeland", "october", "standart")]:
    "https://picsum.photos/seed/eng-egeland-oct-std/800/600",
};

// Tariff-independent overrides. If you set a photo here for a given
// subject+school+month, it will be used for BOTH tariffs unless an exact
// tariff-specific override above is present.
function buildNoTariffKey(
  subject: SubjectKey,
  school: SchoolKey,
  month: MonthKey
) {
  return `${subject}_${school}_${month}` as const;
}

const photoOverridesNoTariff: Partial<Record<string, string>> = {
  // Filled from template file. Put custom links into that file.
  ...photoOverridesNoTariffTemplate,
  // You can also add/override specific entries here manually if needed:
  // [buildNoTariffKey('math','100b','september')]: 'https://your.cdn/math-100b-sep.jpg',
};

// All possible keys (subject+school+month) for final cards without tariff.
// Use this to see every variant you can override.
export const allNoTariffKeys: string[] = subjects.flatMap((subject) =>
  allowedSchoolsBySubject[subject].flatMap((school) =>
    months.map((month) => buildNoTariffKey(subject, school, month))
  )
);

// Helper to get a full template object that you can copy-paste and fill with URLs.
// Keys are all possible combinations; values are empty strings awaiting your links.
export function getNoTariffOverrideTemplate(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const subject of subjects) {
    for (const school of allowedSchoolsBySubject[subject]) {
      for (const month of months) {
        out[buildNoTariffKey(subject, school, month)] = "";
      }
    }
  }
  return out;
}

function pickPhotoUrl(
  subject: SubjectKey,
  school: SchoolKey,
  month: MonthKey,
  tariff: Tariff
): string | undefined {
  const exactKey = buildKey(subject, school, month, tariff);
  if (photoOverrides[exactKey]) return photoOverrides[exactKey]!;
  // If no exact match, use tariff-independent override
  const noTariffKey = buildNoTariffKey(subject, school, month);
  if (photoOverridesNoTariff[noTariffKey])
    return photoOverridesNoTariff[noTariffKey]!;
  // Default: tariff does NOT affect the image (same for both tariffs)
  return `https://picsum.photos/seed/${subject}-${school}-${month}/800/600`;
}

for (const subject of subjects) {
  for (const school of allowedSchoolsBySubject[subject]) {
    for (const month of months) {
      for (const tariff of tariffs) {
        const key = buildKey(subject, school, month, tariff);
        const price = defaultPrice(month, tariff);
        const subjectName = displayNames.subjects[subject];
        const schoolName = displayNames.schools[school];
        const monthName = displayNames.months[month];
        const text = defaultText(
          subjectName,
          schoolName,
          monthName,
          tariff,
          price
        );
        catalog[key] = {
          key,
          subjectKey: subject,
          subjectName,
          schoolKey: school,
          schoolName,
          monthKey: month,
          monthName,
          tariff,
          price,
          text,
          // Choose photo per combination
          photoUrl: pickPhotoUrl(subject, school, month, tariff),
          // Put your real payment links here per-branch
          payUrl: `https://pay.example.com/${encodeURIComponent(key)}`,
        };
      }
    }
  }
}
import { photoOverridesNoTariffTemplate } from "./photoOverrides.noTariff.template.js";
