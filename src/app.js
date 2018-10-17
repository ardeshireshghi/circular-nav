const App = ((exports, CircularNav, PageSection, documentReady, createSectionManager) => {
  let appSectionManager;

  const getPageSectionEls = () => Array.from(document.querySelectorAll(PageSection.DATA_SELECTOR));
  const getNavEl = () => document.querySelector(CircularNav.DATA_SELECTOR);

  const handleSectionClose = (nav, sectionId) => {
    nav.closeItem(sectionId);
    window.location.hash = '';
  };

  const handleNavOpenFinished = (sectionName) => {
    appSectionManager.getPageSection(sectionName).show();
  };

  const createNav = ({onOpenFinished}) => {
    return new CircularNav(getNavEl(), {
      onOpenFinished
    });
  };

  const checkLoadInitialSection = (locationHash) => {
    const sectionName = locationHash.slice(1);
    const pageSection = appSectionManager.getPageSection(sectionName);
    if (pageSection) {
      pageSection.show();
    }
  };

  return {
    async boot({
       nav = createNav({ onOpenFinished: handleNavOpenFinished }),
       SectionManager = createSectionManager()
     } = {}) {
      await documentReady();

      appSectionManager = SectionManager(getPageSectionEls(), {
        onClose: handleSectionClose.bind(null, nav)
      });

      if (window.location.hash) {
        checkLoadInitialSection(window.location.hash);
      }
    }
  };

})(window, CircularNav, PageSection, documentReady, createSectionManager);
