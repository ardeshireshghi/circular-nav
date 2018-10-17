const createSectionManager = ((PageSection) => {
  const factory = () => {
    const manager = (sectionsEl, props) => {
      const {onClose} = props;
      const pageSectionsMap = sectionsEl.reduce((acc, currentSectionEl) => {
        return {
          ...acc,
          [currentSectionEl.id]: PageSection(currentSectionEl, {
            onClose
          })
        };
      }, {});

      return {
        getPageSection(sectionName) {
          return sectionName in pageSectionsMap
            ? pageSectionsMap[sectionName]
            : null;
        }
      };
    };

    return manager;
  };

  return factory;
})(PageSection);
