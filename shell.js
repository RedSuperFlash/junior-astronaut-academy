(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const signal = document.createElement('div');
  signal.className = 'page-signal';
  signal.setAttribute('aria-hidden', 'true');
  document.body.append(signal);
  let entrance;
  function settle() { signal.classList.remove('running'); }
  function reveal(element) {
    entrance?.cancel();
    if (element && !reduced.matches) {
      entrance = element.animate([{opacity:.7}, {opacity:1}], {duration:180,easing:'ease-out'});
    }
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin === location.origin && /\/(index|science|academy)\.html$/.test(url.pathname) &&
        (url.pathname !== location.pathname || url.search !== location.search)) signal.classList.add('running');
  });
  document.addEventListener('click', event => {
    if (event.detail && event.target.closest('[data-page],[data-exp],[data-do="tab"]')) {
      requestAnimationFrame(() => reveal(document.querySelector('#workspace,#experiment,#main')));
    }
  }, true);
  window.addEventListener('pageshow', () => {
    settle();
    if (document.referrer && new URL(document.referrer).origin === location.origin) reveal(document.querySelector('main'));
  });
  window.addEventListener('pagehide',settle);
  window.navigation?.addEventListener('navigateerror',settle);
  window.addEventListener('keydown', e => { if(e.key === 'Escape') settle(); });
})();
