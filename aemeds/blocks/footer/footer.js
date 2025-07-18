import { loadScript } from '../../scripts/aem.js';
import { section } from '../../scripts/dom-helpers.js';
import { getLocale } from '../../scripts/scripts.js';
import { fixRelativeDAMImages, getDataDomain, waitImagesLoad } from '../header/header.js';

export async function injectNaasBundleScript(id, type, version, env, ext) {
  const script = document.createElement('script');
  script.id = id;
  script.setAttribute('async', '');
  document.body.appendChild(script);

  const event = new CustomEvent('naas-create-bundle', {
    detail: {
      id, type, version, env, ext,
    },
  });
  document.dispatchEvent(event);
}
/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.innerHTML = '';

  document.documentElement.setAttribute('data-path-hreflang', getLocale().toLowerCase());
  const dataDomain = getDataDomain();

  try {
    block.append(
      section({
        id: 'naas-footer',
        class: 'naas-footer-section withPaddings',
        'data-domain': dataDomain,
        'data-sourceId': 'blogs',
        'data-lslinkshard': 'on',
      }),
    );

    await Promise.all([
      loadScript(`${dataDomain}/nas/csi/naas.csr.bundles.versioning.init.js`, { async: '' }),
    ]);

    // // load NaaS footer code
    // await Promise.all([
    //   loadCSS(`${dataDomain}/nas/csi/footer/v1/footerCSR.bundle.css`),
    //   loadScript(`${dataDomain}/nas/csi/footer/v1/footerCSR.bundle.js`),
    // ]);

    injectNaasBundleScript('footer-bundle-css', 'footer', 'v1', dataDomain, 'css');
    injectNaasBundleScript('footer-bundle-js', 'footer', 'v1', dataDomain, 'js');

    // trigger and wait for NaaS footer rendering
    await new Promise((resolve) => {
      document.addEventListener('nass-footer-rendered', () => {
        fixRelativeDAMImages(block, dataDomain);
        (async () => {
          await waitImagesLoad(block);
          resolve();
        })();
      });

      document.dispatchEvent(new CustomEvent('naas-load-footer'));
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
