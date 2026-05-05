(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "audio-control",
    title: "Auto-playing media must be controllable",
    description:
      "Audio or video that auto-plays for more than three seconds must be muted, must offer a pause/stop control, or must not start automatically.",
    whyItMatters:
      "Auto-playing audio drowns out screen-reader speech and is impossible to stop without a control, especially for blind and motor-impaired users.",
    severity: "serious",
    recommendation:
      "Either set the muted attribute, remove autoplay, or always render visible controls (the controls attribute or a player UI).",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "audio[autoplay], video[autoplay]",
    standards: {
      wcag20: { criterion: "1.4.2", level: "A" },
      wcag21: { criterion: "1.4.2", level: "A" },
      wcag22: { criterion: "1.4.2", level: "A" },
      si5568: { criterion: "1.4.2", clause: "SI 5568 Part 1 (1.4.2)", level: "A" },
    },
    i18n: {
      en: {
        title: "Auto-playing media must be controllable",
        description:
          "Audio or video that auto-plays for more than three seconds must be muted, offer a pause/stop control, or not auto-start.",
        whyItMatters:
          "Auto-playing audio drowns out screen-reader speech and is impossible to stop without a control. This is especially blocking for blind and motor-impaired users.",
        recommendation:
          "Either add the muted attribute, remove autoplay, or always render visible controls (the controls attribute or a player UI).",
      },
      he: {
        title: 'תוכן שמע/וידאו שמתנגן אוטומטית חייב להיות נשלט',
        description:
          'תוכן שמע או וידאו שמתנגן אוטומטית למשך יותר משלוש שניות חייב להיות מושתק, לכלול פקדי עצירה/השהיה, או שלא להתחיל אוטומטית.',
        whyItMatters:
          'שמע שמתנגן אוטומטית משתיק את ההקראה של קוראי המסך, ובלא פקדים אי אפשר לעצור אותו — דבר שחוסם במיוחד עיוורים ובעלי מוגבלות מוטורית.',
        recommendation:
          'הוסיפו את התכונה muted, הסירו autoplay, או הציגו תמיד פקדי שליטה (controls או נגן עם פקדים נראים).',
      },
    },
    si5568: {
      coveredByPdf: true,
      part: 1,
      clause: "1.4.2",
      level: "A",
      annexDOverride: null,
      sourceQuote: {
        en: 'SI 5568 Part 1, criterion 1.4.2 — if any audio on a Web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control the audio volume independently from the overall system volume level.',
        he: 'ת"י 5568 חלק 1, סעיף 1.4.2 — אם תוכן שמע מתנגן אוטומטית בדף יותר מ-3 שניות, יש לספק מנגנון להשהיה או לעצירה של השמע, או מנגנון לשליטה בעוצמת השמע הזה בנפרד מעוצמת השמע הכללית של המערכת.',
      },
    },
    run(doc) {
      const players = a11y.toArray(doc.querySelectorAll("audio[autoplay], video[autoplay]"));
      const failedNodes = players.filter((el) => {
        if (el.hasAttribute("muted")) return false;
        if (el.hasAttribute("controls")) return false;
        return true;
      });
      return { total: players.length, failedNodes };
    },
  });
})();
