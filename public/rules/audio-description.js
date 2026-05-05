(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "audio-description",
    title: "Pre-recorded video should provide audio description",
    description:
      "Pre-recorded video with audio must include either an audio description (describes visual content for blind users) or a media alternative (full text transcript with visuals described).",
    whyItMatters:
      "Captions cover dialogue and sound effects but do nothing for visual-only information (a chart appearing on screen, a person nodding silently). Blind users miss that information without audio description.",
    severity: "serious",
    recommendation:
      "Add a <track kind='descriptions'> child to <video>, or provide a textual media alternative linked near the video describing the visuals.",
    disabilities: ["visual"],
    selectorHint: "video",
    standards: {
      wcag20: { criterion: "1.2.3", level: "A" },
      wcag21: { criterion: "1.2.3", level: "A" },
      wcag22: { criterion: "1.2.3", level: "A" },
      // SI 5568 Part 1 Annex D promotes 1.2.3 from A to AA.
      si5568: {
        criterion: "1.2.3",
        clause: "SI 5568 Part 1 Annex D (1.2.3 → AA)",
        level: "AA",
      },
    },
    i18n: {
      en: {
        title: "Pre-recorded video should provide audio description",
        description:
          "Pre-recorded video with audio must include either an audio description (describes visual content for blind users) or a media alternative (full text transcript with visuals described).",
        whyItMatters:
          "Captions cover dialogue, but blind users still miss any visual-only information (charts, gestures). Audio description fills that gap.",
        recommendation:
          "Add <track kind='descriptions'>, supply a video file with a separate description audio track, or link a textual media alternative near the video.",
      },
      he: {
        title: 'בסרטוני וידאו מוקלטים מראש יש לספק תיאור שמע',
        description:
          'סרטוני וידאו מוקלטים מראש (בשילוב שמע) חייבים לכלול תיאור שמע (audio description) המתאר את התוכן החזותי, או חלופה למדיה (תמלול טקסטואלי הכולל תיאור של הנראה בסרטון).',
        whyItMatters:
          'כתוביות מכסות דיאלוג ואפקטי קול, אך משתמשים עיוורים עדיין מפסידים מידע חזותי בלבד (טבלאות, מחוות, מצגות). תיאור שמע משלים את החסר.',
        recommendation:
          'הוסיפו <track kind="descriptions"> לתגית <video>, או ספקו ערוץ שמע נוסף עם התיאור, או קישור לחלופה טקסטואלית הכוללת תיאור של ההתרחשות החזותית.',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 1,
      clause: "1.2.3",
      level: "A",
      annexDOverride: "AA",
      sourceQuote: {
        en: 'SI 5568 Part 1, Annex D — for video plus audio that is pre-recorded, captions must be supplied AND one of: (a) a textual alternative of the events in an understandable form, OR (b) an audio description of the events in an additional audio channel. The Israeli standard raises the conformance level for criterion 1.2.3 from A to AA.',
        he: 'ת"י 5568 חלק 1, נספח ד׳ — עבור וידאו + שמע שהוקלטו מראש: יש לספק כתוביות, וגם אחד מהשניים: (א) חלופה טקסטואלית של ההתרחשות, בצורה מובנת, בעבור כל תוכן המדיה, או (ב) תיאור שמע של ההתרחשות בערוץ שמע נוסף. התקן הישראלי מעלה את רמת התאימות של סעיף 1.2.3 מ-A ל-AA.',
      },
    },
    run(doc) {
      const videos = a11y.toArray(doc.querySelectorAll("video"));
      const failedNodes = videos.filter((video) => {
        // Skip muted-only / autoplay decorative banners with no audio track.
        if (video.hasAttribute("muted") && !video.hasAttribute("controls")) return false;
        const hasDescriptions = Boolean(
          video.querySelector('track[kind="descriptions"]')
        );
        if (hasDescriptions) return false;
        // Allow a textual media alternative linked nearby.
        const parent = video.parentElement;
        if (parent) {
          const text = (parent.textContent || "").toLowerCase();
          if (
            text.includes("audio description") ||
            text.includes("transcript") ||
            text.includes("תיאור שמע") ||
            text.includes("תמלול")
          ) {
            return false;
          }
        }
        return true;
      });
      return { total: videos.length, failedNodes };
    },
  });
})();
