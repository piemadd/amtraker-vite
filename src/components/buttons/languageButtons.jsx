import { useEffect, useRef, useState } from "react";
import { getLocale, setLocale } from "../../paraglide/runtime.js";

const languages = [
  { locale: "en", flag: "🇺🇸", name: "English" },
  { locale: "es", flag: "🇲🇽", name: "Español" },
  { locale: "fr", flag: "🇨🇦", name: "Français" }
];

const LanguageButtons = ({ headerStyle = false }) => {
  const currentLocale = getLocale();
  const current = languages.find((language) => language.locale == currentLocale) ?? languages[0];
  const [isOpen, setIsOpen] = useState(false);
  const holderRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (holderRef.current && !holderRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={holderRef}
      style={{ position: "relative", display: "flex", alignItems: "center", height: headerStyle ? "75%" : null }}
    >
      <button
        ref={buttonRef}
        className="root"
        title={current.name}
        aria-label={current.name}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        style={{
          fontSize: "20px",
          width: "48px",
          height: headerStyle ? "100%" : "48px",
          textAlign: "center",
          lineHeight: headerStyle ? "20px" : "0px",
          paddingTop: headerStyle ? "calc(0.5em - 2px)" : null
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {current.flag}
      </button>
      {isOpen ? (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: headerStyle ? "calc(100% + 4px)" : null,
            bottom: headerStyle ? null : "calc(100% + 8px)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "4px",
            backgroundColor: "rgb(10, 10, 10)",
            border: "1px solid #444",
            borderRadius: "8px"
          }}
        >
          {languages.map(({ locale, flag, name }) => (
            <button
              key={locale}
              className="root"
              role="menuitemradio"
              aria-checked={currentLocale == locale}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "auto",
                whiteSpace: "nowrap",
                textAlign: "left",
                fontSize: "16px",
                padding: "8px 12px",
                backgroundColor: currentLocale == locale ? "rgba(0, 0, 0, 0.85)" : null,
                borderColor: currentLocale == locale ? "#fff" : null
              }}
              onClick={() => {
                setIsOpen(false);
                if (currentLocale !== locale) setLocale(locale); // switches to the same page with the new /fr/ or /es/ prefix, without a reload (see src/index.jsx)
              }}
            >
              <span style={{ fontSize: "20px" }}>{flag}</span>
              {name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default LanguageButtons;
