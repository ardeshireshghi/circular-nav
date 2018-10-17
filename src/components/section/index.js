const PageSection = ((window) => {
  const Selectors = {
    CLOSE: '.page__section__close--js'
  };

  const Section = (el, {
    onClose = () => {
    }
  } = {}) => {
    const sectionEl = el;

    sectionEl.addEventListener('click', (event) => {
      if (event.target.matches(Selectors.CLOSE)) {
        sectionEl.classList.toggle('is-hidden');
        sectionEl.classList.toggle('is-shown');

        onClose(sectionEl.id);
      }
    });

    return {
      show() {
        sectionEl.classList.add('is-shown');
        sectionEl.classList.remove('is-hidden');
      }
    }
  };

  Section.DATA_SELECTOR = '[data-page-section]';

  return Section;
})(window);
