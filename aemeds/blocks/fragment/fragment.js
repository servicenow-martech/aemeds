/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @param {boolean} deferSubBlocks Leaves the sub-blocks not loaded for the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path, deferSubBlocks) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      if (!deferSubBlocks) {
        await loadBlocks(main);
      }
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path, block.classList.contains('defer-sub-blocks'));
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      const mainSection = block.closest('.section');
      mainSection.classList.add(...fragmentSection.classList);
      // initial file metadata overrides the fragment metadata in case of conflicts
      const mergedDataset = { ...fragmentSection.dataset, ...mainSection.dataset };
      Object.keys(mergedDataset).forEach((key) => {
        mainSection.dataset[key] = mergedDataset[key];
      });
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
