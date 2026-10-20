/* Scroll-driven chapter tracking. Works with or without the map.
   map.js subscribes through window.Story.onChange(). */
(function () {
  document.documentElement.classList.add("js");

  const chapters = Array.from(document.querySelectorAll(".chapter"));
  const navLinks = Array.from(document.querySelectorAll(".nav a[data-nav]"));
  const mapwrap = document.getElementById("mapwrap");
  const mobile = window.matchMedia("(max-width: 900px)");
  const listeners = [];
  let current = null;

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // The line a chapter has to cross to become active.
  function probeY() {
    if (!mobile.matches) return window.innerHeight * 0.45;
    const bottom = mapwrap.getBoundingClientRect().bottom;
    return bottom + (window.innerHeight - bottom) * 0.3;
  }

  function pick() {
    const y = probeY();
    let found = chapters[0];
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) found = chapters[chapters.length - 1];
    else {
      for (const ch of chapters) {
        if (ch.getBoundingClientRect().top <= y) found = ch;
        else break;
      }
    }
    if (found !== current) activate(found);
  }

  function activate(ch) {
    if (current) current.classList.remove("active");
    current = ch;
    ch.classList.add("active");
    const nav = ch.dataset.nav;
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === nav));
    listeners.forEach((fn) => fn(ch.dataset.chapter));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; pick(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  pick();

  window.Story = {
    get current() { return current && current.dataset.chapter; },
    onChange(fn) { listeners.push(fn); if (current) fn(current.dataset.chapter); },
  };
})();
