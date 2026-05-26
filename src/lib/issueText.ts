/**
 * Resolve the rendered text for an issue or coverage row, given the active
 * compliance standard and the user's preferred language.
 *
 * Decision tree:
 *   - if standard === "si5568" and the rule has si5568 metadata, use the
 *     SI 5568 source quote in `language` and append a citation footer.
 *   - in either case, the title / description / whyItMatters / recommendation
 *     come from `i18n[language]` when present, otherwise fall back to the
 *     scanner-emitted English fields.
 */
import type {
  AccessibilityIssue,
  Language,
  RuleI18n,
  ScannerStandard,
  Si5568Meta,
  WcagCheckStat,
} from "../types";

export type ResolvedIssueText = {
  title: string;
  description: string;
  whyItMatters?: string;
  recommendation?: string;
  /** Full quoted text from the SI 5568 PDF (only set when SI 5568 is active). */
  si5568Quote?: string;
  /** Plain-text citation line, e.g. 'מקור: ת"י 5568 חלק 2, סעיף 1.1.1, רמה A'. */
  si5568Citation?: string;
  /** Annex D override label, e.g. 'תוקן בנספח ד׳ ל-AA'. */
  annexDOverrideLabel?: string;
};

type IssueLike = Pick<
  AccessibilityIssue,
  "ruleId" | "title" | "description" | "whyItMatters" | "recommendation"
> & {
  i18n?: RuleI18n;
  si5568?: Si5568Meta;
};

const HE = (s: string | undefined): string | undefined => s;

const HE_RULE_TEXT: Record<string, RuleI18n["he"]> = {
  "accessibility-statement": {
    title: "בכל דף יש לקשר להצהרת הנגישות של האתר",
    description: "תקנות הנגישות בישראל דורשות קישור להצהרת הנגישות של האתר מכל דף.",
    whyItMatters: "הצהרת הנגישות מאפשרת למשתמשים לדווח על חסמים, לבקש התאמות וליצור קשר עם רכז הנגישות.",
    recommendation: "הוסיפו קישור גלוי להצהרת הנגישות בכותרת או בתחתית האתר.",
  },
  "aria-misuse": {
    title: "מאפייני ARIA חייבים להיות תקינים",
    description: "תפקידי ARIA חייבים להיות תקניים, הפניות מזהים חייבות להתקיים, ואין להסתיר רכיבים פוקוסביליים עם aria-hidden.",
    whyItMatters: "ARIA שגוי עלול לגרום לקוראי מסך להתעלם מרכיבים, להכריז שם שגוי או לחשוף רכיב שאינו ניתן לשימוש.",
    recommendation: "בדקו שמות roles, ודאו שכל aria-labelledby / aria-describedby מפנים למזהים קיימים, ואל תשתמשו ב-aria-hidden על רכיבים פוקוסביליים.",
  },
  "audio-control": {
    title: "מדיה שמתנגנת אוטומטית חייבת להיות ניתנת לשליטה",
    description: "שמע או וידאו שמתנגנים אוטומטית יותר משלוש שניות חייבים להיות מושתקים, לכלול פקדים, או לא להתחיל אוטומטית.",
    whyItMatters: "שמע אוטומטי מפריע לקוראי מסך ועלול לחסום משתמשים שאינם מצליחים לעצור אותו במהירות.",
    recommendation: "הוסיפו muted או controls, או הסירו autoplay.",
  },
  "audio-description": {
    title: "וידאו מוקלט צריך לכלול תיאור שמע",
    description: "וידאו מוקלט עם שמע צריך לכלול תיאור שמע או חלופה טקסטואלית מלאה שמתארת את המידע החזותי.",
    whyItMatters: "כתוביות אינן מתארות מידע חזותי בלבד כמו תרשים, מחווה או פעולה שקטה.",
    recommendation: "הוסיפו track מסוג descriptions או קישור לחלופה טקסטואלית שמתארת את הווידאו.",
  },
  "audio-text-alt": {
    title: "לתוכן שמע דרושה חלופה טקסטואלית",
    description: "שמע מוקלט מראש צריך להיות מלווה בתמלול או חלופה טקסטואלית.",
    whyItMatters: "משתמשים חרשים וכבדי שמיעה אינם יכולים לגשת לתוכן שמע ללא תמלול.",
    recommendation: "ספקו קישור גלוי לתמלול ליד רכיב השמע או track מתאים כשזה רלוונטי.",
  },
  "color-contrast": {
    title: "ניגודיות טקסט חייבת לעמוד ביחסי WCAG",
    description: "טקסט רגיל צריך יחס ניגודיות של לפחות 4.5:1 מול הרקע, וטקסט גדול צריך לפחות 3:1.",
    whyItMatters: "טקסט בניגודיות נמוכה קשה או בלתי אפשרי לקריאה עבור משתמשים עם לקות ראייה.",
    recommendation: "שפרו את צבע הטקסט או הרקע כך שהיחס מול הרקע האפקטיבי יעמוד בדרישה.",
  },
  "content-on-hover": {
    title: "אין להסתמך על title בלבד עבור טולטיפים חשובים",
    description: "רכיבים פוקוסביליים שמסתמכים על title ללא aria-describedby עלולים להציג מידע שנעלם מהר מדי.",
    whyItMatters: "טולטיפים טבעיים של הדפדפן אינם אמינים למקלדת, למסך מגע, להגדלה ולמשתמשים עם קשיי קריאה.",
    recommendation: "החליפו title בטולטיפ נגיש, ניתן לסגירה, יציב ומקושר עם aria-describedby.",
  },
  "document-title": {
    title: "לדף חייב להיות title שאינו ריק",
    description: "כל דף צריך title משמעותי בתוך head שמתאר את התוכן או המטרה.",
    whyItMatters: "כותרת הדף משמשת לשוניות דפדפן, היסטוריה, סימניות והכרזות קוראי מסך.",
    recommendation: "הוסיפו title תיאורי והימנעו מכותרות ריקות או כלליות.",
  },
  "duplicate-id": {
    title: "מזהי id חייבים להיות ייחודיים במסמך",
    description: "שימוש חוזר באותו id שובר קשרים כמו label/for, aria-labelledby ו-aria-describedby.",
    whyItMatters: "טכנולוגיות מסייעות עלולות לקשר תווית או תיאור לרכיב הלא נכון.",
    recommendation: "ודאו שכל id מופיע פעם אחת בלבד. השתמשו ב-class עבור עיצוב משותף.",
  },
  "error-identification": {
    title: "שדות לא תקינים חייבים להכריז את הודעת השגיאה",
    description: "שדה עם aria-invalid='true' צריך להפנות להודעת שגיאה לא ריקה או להיות ליד אזור alert/live.",
    whyItMatters: "משתמשי קוראי מסך שומעים שהשדה לא תקין אך לא יודעים מה הבעיה.",
    recommendation: "קשרו את השדה להודעת שגיאה גלויה עם aria-describedby או הציגו role='alert' סמוך.",
  },
  "fieldset-legend": {
    title: "קבוצות רדיו וצ'קבוקס צריכות fieldset ו-legend",
    description: "קבוצות של שני פקדים או יותר עם אותו name צריכות קיבוץ סמנטי ותווית קבוצה.",
    whyItMatters: "קוראי מסך מקריאים את ה-legend עם כל אפשרות, כך שהמשתמש מבין לאיזו שאלה הוא עונה.",
    recommendation: "עטפו ב-fieldset עם legend לא ריק, או השתמשו ב-role group/radiogroup עם aria-labelledby.",
  },
  "focus-visible": {
    title: "סימון פוקוס חייב להישאר גלוי",
    description: "אין להסיר outline בפוקוס בלי לספק סימון פוקוס חלופי וברור.",
    whyItMatters: "משתמשי מקלדת צריכים לדעת איפה הפוקוס נמצא כדי לנווט ולפעול.",
    recommendation: "הוסיפו outline, box-shadow, border או סגנון focus-visible ברור.",
  },
  "form-label": {
    title: "פקדי טופס חייבים תווית",
    description: "לכל input, select ו-textarea צריכה להיות תווית תוכנתית שמסבירה את מטרת השדה.",
    whyItMatters: "ללא תווית, קוראי מסך מכריזים רק את סוג הפקד בלי להסביר מה להזין.",
    recommendation: "השתמשו ב-label, aria-label או aria-labelledby. placeholder לבדו אינו תווית.",
  },
  "heading-order": {
    title: "כותרות חייבות לשמור על מבנה היררכי תקין",
    description: "כותרות לא צריכות לדלג רמות, להיות ריקות, או ליצור מבנה עמוד לא ברור.",
    whyItMatters: "משתמשי קוראי מסך מנווטים לפי רשימת כותרות. מבנה שבור מקשה על התמצאות.",
    recommendation: "התחילו ב-h1 יחיד, אל תדלגו רמות, ומלאו או הסירו כותרות ריקות.",
  },
  "hebrew-rtl": {
    title: "דפים בעברית חייבים lang='he' ו-dir='rtl'",
    description: "כאשר תוכן הדף בעברית, צריך להגדיר שפה וכיוון כתיבה מתאימים.",
    whyItMatters: "ללא הגדרות אלו, קוראי מסך והדפדפן עלולים להציג או להגות עברית באופן שגוי.",
    recommendation: "הגדירו html lang='he' dir='rtl', וסמנו מקטעים בשפה אחרת לפי הצורך.",
  },
  "html-lang": {
    title: "המסמך חייב להגדיר שפת דף תקינה",
    description: "תגית html צריכה לכלול מאפיין lang לא ריק עם קוד שפה תקין.",
    whyItMatters: "קוראי מסך משתמשים בשפה כדי לבחור הגייה וקול מתאימים.",
    recommendation: "הגדירו lang מתאים, למשל en, he או ar.",
  },
  "iframe-title": {
    title: "ל-iframe חייבת להיות כותרת תיאורית",
    description: "כל iframe צריך title או aria-label שמסביר מה התוכן המשובץ.",
    whyItMatters: "קוראי מסך מכריזים מסגרות לפי הכותרת שלהן, אחרת המשתמש שומע רק 'frame'.",
    recommendation: "הוסיפו title משמעותי, למשל title='סרטון הדרכה'.",
  },
  "image-alt": {
    title: "לתמונות חייב להיות טקסט חלופי",
    description: "כל img צריך מאפיין alt. תמונות קישוט יכולות להשתמש ב-alt ריק.",
    whyItMatters: "משתמשים עיוורים אינם יכולים להבין תמונות מידע ללא חלופה טקסטואלית.",
    recommendation: "הוסיפו alt משמעותי לתמונות מידע ו-alt ריק לתמונות קישוט.",
  },
  "images-of-text": {
    title: "יש להימנע מתמונות של טקסט",
    description: "כאשר תמונה מכילה טקסט ארוך, עדיף להציג את הטקסט כ-HTML אמיתי.",
    whyItMatters: "תמונות טקסט אינן ניתנות להגדלה, התאמה, תרגום או שינוי סגנון בצורה טובה.",
    recommendation: "החליפו תמונות טקסט בטקסט HTML, למעט לוגואים או מצבים שבהם הצורה חיונית.",
  },
  "input-purpose": {
    title: "שדות נפוצים צריכים להגדיר autocomplete",
    description: "שדות שאוספים פרטים אישיים נפוצים צריכים להשתמש בטוקן autocomplete מתאים.",
    whyItMatters: "autocomplete עוזר לדפדפן, מנהלי סיסמאות וכלי נגישות לזהות את מטרת השדה.",
    recommendation: "הוסיפו autocomplete מתאים כמו email, given-name, tel או current-password.",
  },
  "interactive-name": {
    title: "רכיבים אינטראקטיביים צריכים שם נגיש",
    description: "קישורים, כפתורים ורכיבים עם role button/link צריכים שם נגיש שאינו ריק.",
    whyItMatters: "ללא שם, קורא מסך מכריז רק 'כפתור' או 'קישור' בלי להסביר את הפעולה.",
    recommendation: "ספקו טקסט גלוי, aria-label, aria-labelledby, title או alt לתמונה פנימית.",
  },
  "keyboard-handler": {
    title: "רכיבים לחיצים חייבים לפעול עם מקלדת",
    description: "רכיבים אינטראקטיביים מותאמים אישית צריכים להיות פוקוסביליים ולהגיב למקלדת.",
    whyItMatters: "משתמשי מקלדת אינם יכולים להפעיל רכיב שמגיב רק לעכבר.",
    recommendation: "עדיף להשתמש ב-button או a href. אחרת הוסיפו role, tabindex='0' וטיפול ב-Enter/Space.",
  },
  "label-in-name": {
    title: "השם הנגיש צריך לכלול את התווית הגלויה",
    description: "כאשר לפקד יש תווית גלויה, השם הנגיש שלו צריך לכלול אותה.",
    whyItMatters: "משתמשי שליטה קולית מפעילים רכיבים לפי הטקסט שהם רואים על המסך.",
    recommendation: "ודאו ש-aria-label אינו מחליף את הטקסט הגלוי בשם אחר, אלא כולל אותו.",
  },
  "language-of-parts": {
    title: "מקטעים בשפה זרה צריכים lang משלהם",
    description: "מקטעים ששפתם שונה משפת הדף צריכים להגדיר lang מתאים.",
    whyItMatters: "קוראי מסך עלולים להגות טקסט בשפה זרה באמצעות קול או כללי הגייה שגויים.",
    recommendation: "עטפו את המקטע והגדירו lang, למשל span lang='en' בתוך דף עברי.",
  },
  "link-purpose": {
    title: "טקסט קישור חייב לתאר את היעד",
    description: "קישורים עם טקסט כללי כמו 'לחץ כאן' או 'קרא עוד' אינם מסבירים את היעד.",
    whyItMatters: "משתמשי קוראי מסך מנווטים לעיתים ברשימת קישורים מחוץ להקשר.",
    recommendation: "החליפו טקסט כללי בטקסט תיאורי או הוסיפו הקשר בשם הנגיש.",
  },
  "main-landmark": {
    title: "הדף צריך לכלול אזור main אחד",
    description: "כל דף צריך לכלול main אחד או רכיב אחד עם role='main'.",
    whyItMatters: "ציוני דרך מאפשרים למשתמשי קוראי מסך לדלג ישירות לתוכן המרכזי.",
    recommendation: "עטפו את התוכן המרכזי של הדף בתגית main אחת בלבד.",
  },
  "meta-refresh": {
    title: "אין לרענן או להפנות דף אוטומטית",
    description: "meta refresh עם זמן חיובי מרענן או מפנה את הדף ללא שליטת המשתמש.",
    whyItMatters: "משתמשים שקוראים או פועלים לאט עלולים לאבד את המקום או לא להספיק להשלים פעולה.",
    recommendation: "הסירו meta refresh או ספקו מנגנון ברור לעצירה, הארכה או אישור.",
  },
  "multiple-ways": {
    title: "יש לספק כמה דרכים לאיתור תוכן",
    description: "אתר צריך לכלול לפחות שתי דרכי ניווט כמו תפריט, חיפוש, מפת אתר או תוכן עניינים.",
    whyItMatters: "משתמשים עם קשיים קוגניטיביים או חוסר היכרות עם האתר צריכים יותר מנתיב אחד לתוכן.",
    recommendation: "הוסיפו ניווט, חיפוש נגיש, קישור למפת אתר או תוכן עניינים.",
  },
  "non-text-contrast": {
    title: "רכיבי ממשק וגרפיקה צריכים ניגודיות 3:1",
    description: "גבולות של פקדים ורכיבים גרפיים משמעותיים צריכים ניגודיות מספקת מול הרקע.",
    whyItMatters: "משתמשים עם לקות ראייה מסתמכים על גבולות וצורות כדי למצוא ולהבין פקדים.",
    recommendation: "שפרו צבעי גבול, מילוי או אייקונים כך שיעמדו ביחס 3:1.",
  },
  "on-focus": {
    title: "פוקוס לא צריך לגרום לשינוי הקשר",
    description: "מעבר פוקוס לרכיב לא צריך לשלוח טופס, לנווט או לפתוח חלון.",
    whyItMatters: "משתמשי מקלדת וקוראי מסך עוברים בין רכיבים כדי לחקור את הדף.",
    recommendation: "העבירו פעולות כאלה ל-click/change מפורשים או בקשו אישור מהמשתמש.",
  },
  "on-input": {
    title: "שינוי ערך לא צריך לגרום לשינוי הקשר",
    description: "בחירה או הקלדה לא צריכות לשלוח טופס או לנווט בלי אזהרה.",
    whyItMatters: "משתמשים עלולים לשנות ערך בזמן חקירה ולגרום לפעולה לא צפויה.",
    recommendation: "דרשו כפתור אישור או שליחה מפורש, והזהירו מראש אם שינוי גורם לניווט.",
  },
  "orientation-lock": {
    title: "הדף לא צריך לנעול כיוון מסך",
    description: "אין להגביל את התוכן לאורך או לרוחב בלבד אלא אם הדבר חיוני לחלוטין.",
    whyItMatters: "משתמשים שמכשירם מקובע לכיוון מסוים אינם יכולים לסובב אותו פיזית.",
    recommendation: "הימנעו מנעילת orientation או מסיבוב כפוי של html/body.",
  },
  "pause-stop-hide": {
    title: "תוכן נע או מתעדכן חייב להיות ניתן לעצירה",
    description: "תוכן שמתנגן, נע, גולל או מתעדכן יותר מחמש שניות צריך מנגנון השהיה, עצירה או הסתרה.",
    whyItMatters: "תנועה מתמשכת מסיחה את הדעת ועלולה לגרום קושי קוגניטיבי או פיזי.",
    recommendation: "הוסיפו כפתור השהיה/עצירה, הימנעו מ-marquee, וכבדו prefers-reduced-motion.",
  },
  "placeholder-only-label": {
    title: "placeholder אינו תחליף לתווית",
    description: "שדה שמשתמש רק ב-placeholder כתווית מאבד את ההקשר כשהמשתמש מתחיל להקליד.",
    whyItMatters: "placeholder לא תמיד מוקרא, נעלם בזמן הקלדה ולעיתים בעל ניגודיות נמוכה.",
    recommendation: "הוסיפו label, aria-label או aria-labelledby בנוסף ל-placeholder.",
  },
  "pointer-cancellation": {
    title: "הפעלה באירוע לחיצה מטה חייבת להיות ניתנת לביטול",
    description: "פעולה לא צריכה להתבצע רק ב-mousedown אם אין דרך לבטל לפני שחרור הלחיצה.",
    whyItMatters: "משתמשים עם מוגבלות מוטורית צריכים אפשרות לגרור החוצה כדי לבטל לחיצה שגויה.",
    recommendation: "העבירו את ההפעלה ל-click או pointerup, והשאירו mousedown למשוב חזותי בלבד.",
  },
  "skip-link": {
    title: "הדף צריך קישור דילוג לתוכן המרכזי",
    description: "קישור דילוג ראשון בפוקוס מאפשר למשתמשי מקלדת לעקוף ניווט חוזר.",
    whyItMatters: "בלי קישור דילוג, משתמשים צריכים לעבור שוב ושוב דרך תפריטים ארוכים.",
    recommendation: "הוסיפו קישור כמו 'דלג לתוכן המרכזי' שמפנה ל-main קיים.",
  },
  "status-messages": {
    title: "טפסים וממשק דינמי צריכים הודעות מצב נגישות",
    description: "דפים עם טפסים או משוב דינמי צריכים אזור live כגון role='status' או role='alert'.",
    whyItMatters: "הודעות הצלחה או שגיאה שמתווספות ב-JavaScript לא יוקראו ללא live region.",
    recommendation: "הוסיפו אזור aria-live ועדכנו בו הודעות אימות, הצלחה ושגיאה.",
  },
  "tabindex-positive": {
    title: "יש להימנע מערכי tabindex חיוביים",
    description: "tabindex גדול מ-0 יוצר סדר פוקוס ידני וקשה לתחזוקה.",
    whyItMatters: "סדר פוקוס מלאכותי עלול לקפוץ בדף ולא להתאים לסדר החזותי או הלוגי.",
    recommendation: "השתמשו ב-tabindex='0' רק כשצריך, או הסתמכו על סדר ה-DOM הטבעי.",
  },
  "tables-headers": {
    title: "טבלאות נתונים חייבות להגדיר כותרות",
    description: "טבלאות נתונים צריכות תאי th או role מתאים, וגם caption או שם נגיש.",
    whyItMatters: "קוראי מסך צריכים כותרות כדי להכריז את הקשר השורה והעמודה של כל תא.",
    recommendation: "הוסיפו th עם scope מתאים ו-caption או aria-label שמתארים את הטבלה.",
  },
  "target-size-minimum": {
    title: "יעדי לחיצה צריכים להיות לפחות 24 על 24 פיקסלים",
    description: "כפתורים, קישורים ויעדי מצביע צריכים להיות גדולים מספיק להפעלה מדויקת.",
    whyItMatters: "יעדים קטנים קשים להפעלה עבור משתמשים עם מוגבלות מוטורית ובמגע.",
    recommendation: "הגדילו את הגודל הגלוי או הוסיפו padding לאזור הלחיץ.",
  },
  "text-spacing": {
    title: "אין לחסום התאמות ריווח טקסט של המשתמש",
    description: "סגנון inline עם !important על ריווח טקסט עלול למנוע התאמות נגישות.",
    whyItMatters: "משתמשים עם לקות ראייה או דיסלקציה משנים ריווח כדי לקרוא בנוחות.",
    recommendation: "הימנעו מ-!important על line-height, letter-spacing או word-spacing בסגנון inline.",
  },
  "use-of-color": {
    title: "אין להסתמך על צבע בלבד לזיהוי קישורים",
    description: "קישורים בתוך טקסט צריכים סימון נוסף מעבר לצבע, כמו קו תחתי או הדגשה.",
    whyItMatters: "משתמשים עם עיוורון צבעים או מצב ניגודיות גבוהה עלולים לא לזהות את הקישור.",
    recommendation: "החזירו קו תחתי, השתמשו בהדגשה, או הוסיפו סימן שאינו תלוי צבע.",
  },
  "video-captions": {
    title: "סרטוני וידאו צריכים כתוביות",
    description: "וידאו מוקלט עם שמע צריך לכלול כתוביות מסונכרנות.",
    whyItMatters: "משתמשים חרשים וכבדי שמיעה אינם יכולים לגשת לתוכן הקולי ללא כתוביות.",
    recommendation: "הוסיפו track מסוג captions/subtitles או השתמשו בנגן שמספק כתוביות.",
  },
  "viewport-resize": {
    title: "ה-viewport חייב לאפשר זום ושינוי גודל",
    description: "meta viewport לא צריך לחסום זום או להגביל maximum-scale לפחות מ-2.",
    whyItMatters: "חסימת זום מונעת ממשתמשים עם לקות ראייה להגדיל תוכן במובייל.",
    recommendation: "השתמשו ב-width=device-width, initial-scale=1 והימנעו מ-user-scalable=no או maximum-scale נמוך.",
  },
};

function formatCitation(meta: Si5568Meta, lang: Language): string {
  if (lang === "he") {
    const partLabel = `ת"י 5568 חלק ${meta.part}`;
    const clausePart = meta.clause ? `, סעיף ${meta.clause}` : "";
    const levelPart = meta.level ? `, רמת תאימות ${meta.level}` : "";
    const base = `מקור: ${partLabel}${clausePart}${levelPart}`;
    return base;
  }
  const partLabel = `SI 5568 Part ${meta.part}`;
  const clausePart = meta.clause ? `, criterion ${meta.clause}` : "";
  const levelPart = meta.level ? `, level ${meta.level}` : "";
  return `Source: ${partLabel}${clausePart}${levelPart}`;
}

function formatAnnexDOverride(meta: Si5568Meta, lang: Language): string | undefined {
  if (!meta.annexDOverride) return undefined;
  if (lang === "he") {
    return `נספח ד׳ של חלק 1 מעלה את רמת התאימות ל-${meta.annexDOverride}`;
  }
  return `Annex D of Part 1 raises conformance level to ${meta.annexDOverride}`;
}

export function pickIssueText(
  issue: IssueLike,
  standard: ScannerStandard,
  language: Language
): ResolvedIssueText {
  const lang: Language = language === "he" ? "he" : "en";
  const localized = issue.i18n?.[lang] ?? (lang === "he" ? HE_RULE_TEXT[issue.ruleId] : undefined);
  const si = standard === "si5568" ? issue.si5568 : undefined;

  const out: ResolvedIssueText = {
    title: localized?.title ?? issue.title,
    description: localized?.description ?? issue.description,
    whyItMatters: localized?.whyItMatters ?? issue.whyItMatters,
    recommendation: localized?.recommendation ?? issue.recommendation,
  };

  if (si) {
    out.si5568Quote = HE(si.sourceQuote?.[lang]);
    out.si5568Citation = formatCitation(si, lang);
    out.annexDOverrideLabel = formatAnnexDOverride(si, lang);
  }

  return out;
}

/**
 * Smaller helper for the coverage table where we mainly need the Hebrew
 * title and the SI clause / level reference.
 */
export type ResolvedStatText = {
  title: string;
  reference?: string;
  annexDOverrideLabel?: string;
};

type StatLike = Pick<WcagCheckStat, "title" | "wcagReference" | "standardReference"> & {
  ruleId: string;
  i18n?: RuleI18n;
  si5568?: Si5568Meta;
};

export function pickStatText(
  stat: StatLike,
  standard: ScannerStandard,
  language: Language
): ResolvedStatText {
  const lang: Language = language === "he" ? "he" : "en";
  const localizedTitle =
    stat.i18n?.[lang]?.title ?? (lang === "he" ? HE_RULE_TEXT[stat.ruleId]?.title : undefined);
  const out: ResolvedStatText = { title: localizedTitle ?? stat.title };

  if (standard === "si5568" && stat.si5568) {
    const meta = stat.si5568;
    if (lang === "he") {
      out.reference = `ת"י 5568 חלק ${meta.part}, סעיף ${meta.clause}, רמה ${meta.level}`;
    } else {
      out.reference = `SI 5568 Part ${meta.part}, ${meta.clause}, level ${meta.level}`;
    }
    out.annexDOverrideLabel = formatAnnexDOverride(meta, lang);
  } else if (stat.standardReference) {
    out.reference = stat.standardReference;
  } else if (stat.wcagReference) {
    out.reference = `WCAG ${stat.wcagReference}`;
  }

  return out;
}
