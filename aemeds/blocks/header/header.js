/* eslint-disable no-await-in-loop, no-continue */
import { loadScript } from '../../scripts/aem.js';
import { section } from '../../scripts/dom-helpers.js';
import { getLocale } from '../../scripts/scripts.js';

// map containing environment configurations
const naasDomains = {
  dev: 'https://www.webdev.servicenow.com',
  qa: 'https://www.webqa.servicenow.com',
  stage: 'https://www.webstg.servicenow.com',
  prod: 'https://www.servicenow.com',
};

export function getDataDomain() {
  const env = new URLSearchParams(window.location.search).get('naas');
  return env ? naasDomains[env.toLowerCase()] || naasDomains.prod : naasDomains.prod;
}

export function fixRelativeDAMImages(block, dataDomain) {
  if (window.location.host.endsWith('servicenow.com')) {
    return;
  }

  block.querySelectorAll('img[src^="/content/dam"]')
    .forEach((image) => { image.src = new URL(new URL(image.src).pathname, dataDomain); });
}

async function isImageInView(img) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.disconnect();
      resolve(false);
    });
    observer.observe(img);
  });
}

export async function waitImagesLoad(block) {
  const images = block.querySelectorAll('img');

  for (let i = 0; i < images.length; i += 1) {
    const img = images[i];

    if (!img) continue;

    if (img.loading === 'lazy' && !await isImageInView(img)) {
      // this image will not be loaded by the browser yet
      continue;
    }

    await new Promise((resolve) => {
      if (img && !img.complete) {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      } else {
        resolve();
      }
    });
  }
}

export async function injectNaasBundleScript(id, type, version, env, ext) {
  const script = document.createElement('script');
  script.id = id;
  script.setAttribute('async','')
  document.head.appendChild(script);

  const event = new CustomEvent('naas-create-bundle', {
    detail: {
      id, type, version, env, ext,
    },
  });

  document.dispatchEvent(event);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.innerHTML = '';

  document.documentElement.setAttribute('data-path-hreflang', getLocale().toLowerCase());
  const dataDomain = getDataDomain();

  try {
    block.append(
      section({
        id: 'naas-header-v3',
        class: 'cmp-nav__wrapper',
        'data-domain': dataDomain,
        'data-myaccount': 'hide',
        'data-search': 'hide',
        'data-sourceId': 'www',
        'data-lslinkshard': 'on',
        'data-version': 'v3',
        role: 'banner',
        'data-theme': 'dark',
        'data-font-family': 'fontawesome',
      }),
    );

    // load NaaS header code
    await Promise.all([
      loadScript(`${dataDomain}/nas/csi/naas.csr.bundles.versioning.init.js`, { async: '' }),
    ]);

    injectNaasBundleScript('header-bundle-css', 'header', 'v3', dataDomain, 'css');
    injectNaasBundleScript('header-bundle-js', 'header', 'v3', dataDomain, 'js');

    document.addEventListener('naas-load-header', () => {
      const utilsScript = document.createElement('script');
      utilsScript.src = `${dataDomain}/nas/common/consumers/blogs/naas-right-side-utils.v1.0.js`;
      utilsScript.defer = true;
      utilsScript.charset = 'UTF-8';
      document.head?.appendChild(utilsScript);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize NaaS header:', e);
  }
}
