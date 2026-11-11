import React, { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const pad = (n) => String(n).padStart(2, "0");
const formatDMY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Navy-and-gold month calendar in a popover. Monday-first, dd/mm/yyyy, days before minDate locked.
function DatePicker({ id, value, onChange, minDate }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const min = startOfDay(minDate);
  const today = startOfDay(new Date());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Move focus into the grid when it opens so keyboard users land on a day
  useEffect(() => {
    if (!open) return;
    const target = gridRef.current?.querySelector(".sel:not(:disabled)") || gridRef.current?.querySelector(".jg-dp-day:not(:disabled)");
    target?.focus();
  }, [open]);

  const toggle = () => {
    if (!open) setView(new Date(value.getFullYear(), value.getMonth(), 1));
    setOpen((o) => !o);
  };

  const pick = (d) => {
    onChange(d);
    setOpen(false);
    rootRef.current?.querySelector(".jg-dp-field")?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      rootRef.current?.querySelector(".jg-dp-field")?.focus();
      return;
    }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step || !e.target.classList.contains("jg-dp-day")) return;
    e.preventDefault();
    const days = [...gridRef.current.querySelectorAll(".jg-dp-day")];
    days[days.indexOf(e.target) + step]?.focus();
  };

  const atMinMonth = view.getFullYear() === min.getFullYear() && view.getMonth() === min.getMonth();
  const lead = (view.getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const shiftMonth = (n) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));

  return (
    <div className="jg-dp" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="jg-dp-field"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <span>{formatDMY(value)}</span>
        <span className="jg-dp-ico" aria-hidden="true" />
      </button>
      {open && (
        <div className="jg-dp-pop" role="dialog" aria-label="Choose an event date" onKeyDown={onKeyDown}>
          <div className="jg-dp-head">
            <button type="button" className="jg-dp-nav" onClick={() => shiftMonth(-1)} disabled={atMinMonth} aria-label="Previous month">←</button>
            <b>{view.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}</b>
            <button type="button" className="jg-dp-nav" onClick={() => shiftMonth(1)} aria-label="Next month">→</button>
          </div>
          <div className="jg-dp-week" aria-hidden="true">
            {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
          </div>
          <div className="jg-dp-grid" ref={gridRef}>
            {Array.from({ length: lead }, (_, i) => <span key={`lead-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = new Date(view.getFullYear(), view.getMonth(), i + 1);
              const locked = d < min;
              const cls = ["jg-dp-day", sameDay(d, today) && "today", sameDay(d, value) && "sel"].filter(Boolean).join(" ");
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  disabled={locked}
                  aria-label={formatDMY(d)}
                  aria-pressed={sameDay(d, value)}
                  onClick={() => pick(d)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
