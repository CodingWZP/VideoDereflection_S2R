document.addEventListener('DOMContentLoaded', () => {
  setupActiveNavigation();
  setupVisitCounter();
});

async function setupVisitCounter() {
  const viewCounter = document.querySelector('#view-count');
  const visitorCounter = document.querySelector('#visitor-count');

  const viewsKey = 'codingwzp-videodereflection-s2r-views-v2';
  const visitorsKey = 'codingwzp-videodereflection-s2r-visitors-v2';
  const visitorFlagKey = 's2r-visited-v2';
  const baseUrl = 'https://countapi.mileshilliard.com/api/v1';

  const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);
  const fetchCount = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Counter returned ${response.status}`);
    const { value } = await response.json();
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error('Counter returned an invalid count');
    }
    return value;
  };

  // views (PV): increment on every page load.
  if (viewCounter) {
    try {
      viewCounter.textContent = formatCount(await fetchCount(`${baseUrl}/hit/${viewsKey}`));
    } catch (error) {
      console.warn('Unable to load the view count.', error);
    }
  }

  // visitors (UV): increment only once per browser via a localStorage flag,
  // then read the current value so the counter always reflects the latest total.
  if (visitorCounter) {
    const isNewVisitor = !localStorage.getItem(visitorFlagKey);
    const endpoint = isNewVisitor ? 'hit' : 'get';
    try {
      visitorCounter.textContent = formatCount(await fetchCount(`${baseUrl}/${endpoint}/${visitorsKey}`));
      if (isNewVisitor) localStorage.setItem(visitorFlagKey, '1');
    } catch (error) {
      console.warn('Unable to load the visitor count.', error);
    }
  }
}

function setupActiveNavigation() {
  const links = [...document.querySelectorAll('.nav-list a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const linkById = new Map(
    links.map((link) => [link.getAttribute('href').slice(1), link]),
  );
  const navigation = document.querySelector('.site-nav');
  let animationFrame = null;

  const setActiveLink = (sectionId) => {
    links.forEach((link) => link.classList.toggle(
      'active',
      link === linkById.get(sectionId),
    ));
  };

  const updateActiveLink = () => {
    animationFrame = null;
    const navigationHeight = navigation?.getBoundingClientRect().height ?? 0;
    const activationLine = navigationHeight + Math.min(window.innerHeight * 0.25, 180);
    const pageBottom = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    let activeSection = null;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) {
        activeSection = section;
      }
    });

    if (pageBottom >= documentHeight - 2) {
      activeSection = sections[sections.length - 1];
    }

    setActiveLink(activeSection?.id);
  };

  const scheduleUpdate = () => {
    if (animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(updateActiveLink);
  };

  links.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveLink(link.getAttribute('href').slice(1));
      scheduleUpdate();
    });
  });

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  updateActiveLink();
}
