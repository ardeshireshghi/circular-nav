const CircularNav = ((window) => {
  const Selectors = {
    NAV_ITEM: '.nav__circular__item',
    NAV_ITEM_LIST: '.nav__circular__items',
    NAV_LIST_WRAPPER: '.nav__circular__wrapper',
    NAV_BUTTON: '.nav__circular__button'
  };

  const ClassNames = {
    NAV_STATE_OPEN: 'nav__circular--opened'
  };

  const CloseTransitionTypes = {
    POP: 'pop',
    MOVE: 'move'
  };

  const NAV_COMPONENT_DATA_SELECTOR = '[data-circular-nav]';
  const MAX_ANIMATION_DELAY_SECONDS = 1.35;

  const VALID_OPTIONS_LIST = [ 
    'distance', 
    'itemClassName', 
    'buttonSize', 
    'buttonBgColor', 
    'itemSize', 
    'closeTransitionType' 
  ];

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;  
  }

  function disableScroll() {
    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', preventDefault, false);
    }
  
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
  }

  function enableScroll() {
    if (window.removeEventListener) {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
    }
        
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
  }

  class CircularNav {
    constructor(navEl, options = {}) {
      this.navEl = navEl;
      this.navItems = [].slice.call(this.navEl.querySelectorAll(Selectors.NAV_ITEM));
      this.navItemsWrapper = navEl.querySelector(Selectors.NAV_LIST_WRAPPER);
      this.settings = {
        ...CircularNav.Defaults,
        ...this.parseOptions(options)
      };

      this.state = {
        opened: false,
        navItemCount: this.navItems.length,
        animating: false
      };

      this.animateNavItem = this.animateNavItem.bind(this);
      this.initialise();
      this.setEventListeners();
    }

    initialise() {
      const { itemClassName } = this.settings;

      if (itemClassName) {
        this.navItems.forEach(item => item.classList.add(itemClassName));
      }

      Object.keys(this.settingToCssVariableMap)
        .forEach((settingName) => {
          const { [settingName]: settingValue } = this.settings;

          if (settingValue) {
            this.navEl.style.setProperty(this.settingToCssVariableMap[settingName], settingValue);
          }
        });
    }

    parseOptions(options) {
      let result = {};
      
      for (let optionName of this.optionsList()) {
        if (optionName in options) {
          result = {
            ...result,
            [optionName]: options[optionName] 
          };

          continue;
        }

        let optionDataAttr = this.navEl.getAttribute(`data-nav-${optionName}`);
       
        if (optionDataAttr) {
          result = {
            ...result,
            [optionName]: optionDataAttr 
          };
        }
      }

      return result;
    }

    optionsList() {
      return VALID_OPTIONS_LIST;
    }
    
    setEventListeners() {
      this.handleAllTransitionEnd = (e) => {
        e.currentTarget.removeEventListener(e.type, this.handleMenuItemTransitionEnd);

        this.state = {
          ...this.state,
          animating: false
        };

        if (!this.state.opened && e.type === 'animationend') {
          this.resetMenuItemStyles();
        }
      };

      this.handleMenuItemTransitionEnd = (e) => {
        if (e.target.matches(Selectors.NAV_ITEM)) {
          const { type: eventType } = e;
          const {
            [`${eventType}Count`]: eventTriggeredCount = 0
          } = this.state;

          this.state = {
            ...this.state,
            [`${eventType}Count`]: eventTriggeredCount + 1
          };

          const areTransitionsFinished = (eventType) => {
            return (eventType === 'transitionend' &&
            (eventTriggeredCount + 1) === (this.navItems.length * 2)) ||
            (eventType === 'animationend' &&
            (eventTriggeredCount + 1) === this.navItems.length)
          };

          if (areTransitionsFinished(eventType)) {
            this.state = {
              ...this.state,
              [`${eventType}Count`]: 0
            };

            this.handleAllTransitionEnd(e);
          }
        }
      };

      this.handleButtonClick = (event) => {
        const { opened } = this.state;

        if (!this.state.animating) {
          this.state = {
            ...this.state,
            opened: !opened
          }

          this.navEl.classList.toggle(ClassNames.NAV_STATE_OPEN);

          if (this.state.opened) {
            this.showMenuItems();
          } else {
            this.hideMenuItems();
          }

          this.navItemsWrapper.style.pointerEvents = (this.state.opened)
            ? 'all' : 'none';
        }
      };

      this.handleNavItemClick = (event) => {
        event.preventDefault();
        const navItem = event.target.tagName === 'A' 
          ? event.target.parentNode 
          : event.target;
        
        this.disableScroll();
        this.openItem(navItem);  
      };

      this.navEl.addEventListener('click', (event) => {
        const target = event.target;

        // Menu button handle
        if (target.matches(Selectors.NAV_BUTTON)) {
          this.handleButtonClick(event);
        }

        if (target.matches(Selectors.NAV_ITEM) ||
          target.parentNode.matches(Selectors.NAV_ITEM)) {
            this.handleNavItemClick(event);
        }
      });
    }

    disableScroll() {
      document.body.style.overflow = 'hidden';
      disableScroll();
    }

    enableScroll() {
      document.body.style.overflow = 'auto';
      enableScroll();
    }

    openItem(navItem) {
      const navLinkEl = navItem.querySelector('a');
      const targetSectionSelector = navLinkEl.getAttribute('href');
      
      navLinkEl.style.display = 'none';  
      navItem.style.zIndex = 1000;

      navItem.dataset.cachedTransform = navItem.style.transform;
      navItem.dataset.cachedTransitionDelay = navItem.style.transitionDelay;
      navItem.dataset.cachedTransitionDuration = navItem.style.transitionDuration;
      navItem.style.transitionDelay = '0s';
      navItem.style.transitionDuration = '0.5s';
      
      navItem.addEventListener('transitionend', (event) => {
        const targetSectionEl = document.body.querySelector(targetSectionSelector);
        navItem.style.zIndex = 1;
        
        targetSectionEl.classList.add('is-shown');
        targetSectionEl.classList.remove('is-hidden');
      }, { once: true });
      
      navItem.style.transform = `${event.target.style.transform} scale(20)`; 
    }
    
    closeItem(sectionId) {
      const navItemWithSectionId = Array.from(this.navEl.querySelectorAll(Selectors.NAV_ITEM))
        .find(itemEl => itemEl.querySelector('a').getAttribute('href').includes(sectionId));

      const navItemLinkEl = navItemWithSectionId.querySelector('a');
      
      navItemWithSectionId.style.transform = navItemWithSectionId.dataset.cachedTransform;
      navItemWithSectionId.style.transitionDelay = navItemWithSectionId.dataset.cachedTransitionDelay;
      navItemWithSectionId.style.transitionDuration = navItemWithSectionId.dataset.cachedTransitionDuration;

      navItemWithSectionId.addEventListener('transitionend', (event) => {
        navItemLinkEl.style.display = 'block';
        this.enableScroll();
      }, { once: true });
    }
    
    showMenuItems() {
      this.state = {
        ...this.state,
        animating: true
      };

      this.navEl
        .querySelector(Selectors.NAV_ITEM_LIST)
        .addEventListener('transitionend', this.handleMenuItemTransitionEnd);
      this.navItems.forEach(this.animateNavItem.bind(this));
    }

    animateNavItem(navItem, index) {
      const { navItemCount } = this.state;
      const degree = (2 * Math.PI) / navItemCount;
      const { distance: radius } = this.settings;

      const transform = {
        x: Math.cos(degree * (index + 1)) * parseInt(radius, 10),
        y: Math.sin(degree * (index + 1)) * parseInt(radius, 10)
      };

      const delay = Math.max(MAX_ANIMATION_DELAY_SECONDS - 2 / (Math.log(index + 4)), 0);

      navItem.style.transitionDelay = `${delay}s`;
      navItem.style.transform = `translateX(${transform.x}px) translateY(${transform.y}px)`;
      navItem.style.opacity = 1;
    }

    hideMenuItems() {
      if (this.settings.closeTransitionType === CloseTransitionTypes.POP) {
        this.navEl
          .querySelector(Selectors.NAV_ITEM_LIST)
          .addEventListener('animationend', this.handleMenuItemTransitionEnd);

        this.navItems.forEach((navItem) => {
          navItem.style.animationName = 'pop-fadeout';
        });

        this.state = {
          ...this.state,
          animating: true
        };
      } else if (this.settings.closeTransitionType === CloseTransitionTypes.MOVE) {
        this.resetMenuItemStyles();
      }
    }

    resetMenuItemStyles() {
      this.navItems.forEach((navItem) => {
        // Remove transition delay on POP mode, force browser reflow
        if (this.settings.closeTransitionType === CloseTransitionTypes.POP) {
          navItem.style.transitionDelay = '0s';
          navItem.style.offsetHeight;
        }

        navItem.style.transform = 'translateX(0) translateY(0)';
        navItem.style.opacity = 0;
        navItem.style.animationName = 'none';
      });
    }

    static get Defaults() {
      return {
        distance: 200,
        buttonSize: '56px',
        closeTransitionType: CloseTransitionTypes.MOVE, // or pop
        itemClassName: '',
      };
    }

    get settingToCssVariableMap() {
      return {
        buttonSize: '--button-size',
        buttonBgColor: '--button-bg-color',
        itemSize: '--item-size'
      };
    }

    static get DATA_SELECTOR() {
      return NAV_COMPONENT_DATA_SELECTOR;
    }
  }

  return CircularNav;
})(window);

;((window, app) => {
  document.addEventListener('DOMContentLoaded', (event) => {
    const navElMatches = Array.from(document.querySelectorAll(CircularNav.DATA_SELECTOR));
    
    if (navElMatches.length) {
      app.nav = navElMatches.map(el => new CircularNav(el))[0];
    }
  });
})(window, app);
