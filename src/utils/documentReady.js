const documentReady = (() => {
  return () => {
    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  };
})();
