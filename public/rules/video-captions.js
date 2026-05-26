(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "video-captions",
    title: "Videos should provide captions",
    description: "Pre-recorded videos must include synchronized captions for users who are deaf or hard of hearing.",
    whyItMatters:
      "Without captions, deaf and hard-of-hearing users cannot access the audio content. Captions also help users in noisy environments and non-native speakers.",
    severity: "serious",
    recommendation:
      "Add a <track kind='captions'> child to every <video>, or provide captions via a video player that supplies them.",
    disabilities: ["hearing"],
    selectorHint: "video",
    standards: {
      wcag20: { criterion: "1.2.2", level: "A" },
      wcag21: { criterion: "1.2.2", level: "A" },
      wcag22: { criterion: "1.2.2", level: "A" },
      // Annex D in Part 1 promotes 1.2.2 from A → AA for the Israeli standard.
      si5568: {
        criterion: "1.2.2",
        clause: "SI 5568 Part 1 Annex D (1.2.2 → AA)",
        level: "AA",
      },
    },
    i18n: {
      en: {
        title: "Pre-recorded video must provide captions",
        description: "Pre-recorded video with audio must include synchronized captions for users who are deaf or hard of hearing.",
        whyItMatters:
          "Without captions, deaf and hard-of-hearing users cannot access the audio content. Captions also help users in noisy environments, non-native speakers, and improve search-engine indexing.",
        recommendation:
          "Add a <track kind='captions'> child to every <video>, or use a video player that supplies captions.",
      },
      he: {
        title: 'בסרטוני וידאו מוקלטים מראש יש לספק כתוביות',
        description: 'סרטוני וידאו מוקלטים מראש (בשילוב שמע) חייבים לכלול כתוביות מסונכרנות עבור חרשים וכבדי שמיעה.',
        whyItMatters:
          'ללא כתוביות, חרשים וכבדי שמיעה אינם יכולים לצרוך את התוכן הקולי של הסרטון. כתוביות גם עוזרות בסביבה רועשת ולדוברי שפה זרה.',
        recommendation:
          'הוסיפו <track kind="captions"> לכל תגית <video>, או השתמשו בנגן וידאו המספק כתוביות.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 1,
      clause: "1.2.2",
      level: "A",
      annexDOverride: "AA",
      sourceQuote: {
        en: 'SI 5568 Part 1, Annex D — for video plus audio that is pre-recorded (e.g. a recorded lecture), captions must be provided. The Israeli standard raises the conformance level for criterion 1.2.2 (Captions, prerecorded) from A to AA.',
        he: 'ת"י 5568 חלק 1, נספח ד׳ — עבור וידאו + שמע שהוקלטו מראש (למשל הקלטת הרצאה בווידאו), יש לספק כתוביות. התקן הישראלי מעלה את רמת התאימות של סעיף 1.2.2 (כתוביות, הקלטה מראש) מ-A ל-AA.',
      },
    },
    run(doc) {
      const videos = a11y.toArray(doc.querySelectorAll("video"));
      const failedNodes = videos.filter((video) => {
        if (a11y.isElementHidden(video)) return false;
        if (video.hasAttribute("muted") && !video.hasAttribute("controls")) return false;
        const hasCaptions = Boolean(
          video.querySelector('track[kind="captions"], track[kind="subtitles"]')
        );
        return !hasCaptions;
      });
      return { total: videos.length, failedNodes };
    },
  });
})();
