const PageSection = ((window) => {
	const Selectors = {
		CLOSE: '.page__section__close--js'
	}
	const Section =  (el, { onClose = () => {} } = {}) => {
		const sectionEl = el;

		sectionEl.addEventListener('click', (event) => {
			if (event.target.matches(Selectors.CLOSE)) {
				sectionEl.classList.toggle('is-hidden');
				sectionEl.classList.toggle('is-shown');

        onClose(sectionEl.id);
			}
		});
	};

  Section.DATA_SELECTOR = '[data-page-section]';

  return Section;
})(window);

;((window, app) => {
  document.addEventListener('DOMContentLoaded', (event) => {
    const sectionMatches = Array.from(document.querySelectorAll(PageSection.DATA_SELECTOR));
    
    if (sectionMatches.length) {
      sectionMatches.forEach(el => PageSection(el, {
        onClose: app.onSectionClose
      }));
    }
  });
})(window, app);