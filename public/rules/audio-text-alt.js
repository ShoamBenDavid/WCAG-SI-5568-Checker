(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "audio-text-alt",
    title: "Audio content needs a text alternative",
    description:
      "Pre-recorded audio (e.g. <audio>) must be accompanied by a transcript or other text alternative.",
    whyItMatters:
      "Without a transcript, deaf and hard-of-hearing users cannot access audio-only content. Transcripts also help search engines, translation, and users in noisy environments.",
    severity: "serious",
    recommendation:
      "Provide a visible transcript link near the <audio> element, or include a <track kind='captions'> when applicable.",
    disabilities: ["hearing"],
    selectorHint: "audio",
    standards: {
      wcag20: { criterion: "1.2.1", level: "A" },
      wcag21: { criterion: "1.2.1", level: "A" },
      wcag22: { criterion: "1.2.1", level: "A" },
      // Annex D in Part 1 promotes 1.2.1 from A → AA for the Israeli standard.
      si5568: {
        criterion: "1.2.1",
        clause: "SI 5568 Part 1 Annex D (1.2.1 → AA)",
        level: "AA",
      },
    },
    i18n: {
      en: {
        title: "Audio content needs a text alternative",
        description: "Pre-recorded audio (e.g. <audio>) must be accompanied by a transcript or other text alternative.",
        whyItMatters:
          "Without a transcript, deaf and hard-of-hearing users cannot access audio-only content. Transcripts also help search engines, translation, and users in noisy environments.",
        recommendation:
          "Provide a visible transcript link near the <audio> element, or include a <track kind='captions'> when applicable.",
      },
      he: {
        title: 'תוכן שמע (audio) חייב חלופה טקסטואלית',
        description: 'שמע מוקלט מראש (למשל בתגית <audio>) חייב להיות מלווה בתמלול או חלופה טקסטואלית אחרת.',
        whyItMatters:
          'ללא תמלול, חרשים וכבדי שמיעה אינם יכולים לצרוך תוכן שמע. תמלולים גם עוזרים למנועי חיפוש, לתרגום ולמשתמשים בסביבה רועשת.',
        recommendation:
          'הציבו קישור גלוי לתמלול בסמוך לתגית <audio>, או הוסיפו <track kind="captions"> אם רלוונטי.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 1,
      clause: "1.2.1",
      level: "A",
      annexDOverride: "AA",
      sourceQuote: {
        en: 'SI 5568 Part 1, Annex D — for pre-recorded audio-only (e.g. a recorded radio program): a textual alternative of the events, in an understandable form, must be provided for the entire media content. The Israeli standard raises the conformance level for criterion 1.2.1 from A to AA.',
        he: 'ת"י 5568 חלק 1, נספח ד׳ — עבור שמע-בלבד מוקלט מראש (למשל תוכנית רדיו מוקלטת): יש לספק חלופה טקסטואלית של ההתרחשות, בצורה מובנת, בעבור כל תוכן המדיה. התקן הישראלי מעלה את רמת התאימות של סעיף 1.2.1 מ-A ל-AA.',
      },
    },
    run(doc) {
      const audios = a11y.toArray(doc.querySelectorAll("audio"));
      const failedNodes = audios.filter((audio) => {
        const hasCaptionTrack = Boolean(
          audio.querySelector('track[kind="captions"], track[kind="subtitles"], track[kind="descriptions"]')
        );
        if (hasCaptionTrack) return false;
        // Heuristic: a sibling element containing 'transcript' (case-insensitive) is OK.
        const parent = audio.parentElement;
        if (parent) {
          const text = (parent.textContent || "").toLowerCase();
          if (text.includes("transcript") || text.includes("תמלול")) return false;
        }
        return true;
      });
      return { total: audios.length, failedNodes };
    },
  });
})();
