// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
// add more delayed functionality here
async function loadAdobeDTM() {
  await loadScript(`${window.hlx.codeBasePath}/scripts/jquery-3.7.1.min.js`);
  const prod = 'https://assets.adobedtm.com/a441b904b50e/7a4facbbcffb/launch-039be8795dc8.min.js';
  const stage = 'https://assets.adobedtm.com/a441b904b50e/7a4facbbcffb/launch-a2ae4c3b0523-staging.min.js';

  const searchParams = new URLSearchParams(window.location.search);
  const env = searchParams.get('launch');
  if (env === 'prod') {
    await loadScript(prod, { async: '' });
    return;
  }

  if (env === 'stage') {
    await loadScript(stage, { async: '' });
    return;
  }

  const { host } = window.location;
  if (host === 'servicenow.com' || host === 'www.servicenow.com') {
    await loadScript(prod, { async: '' });
  } else {
    if (searchParams.get('disableLaunch') === 'true') {
      return;
    }
    await loadScript(stage, { async: '' });
  }

  const appEventData = sessionStorage.getItem('appEventData');
  if (appEventData) {
    window.appEventData = window.appEventData || [];
    window.appEventData.push(...JSON.parse(appEventData));
    sessionStorage.removeItem('appEventData');
    console.log('Restored the following clicks', window.appEventData);
  }
}

loadAdobeDTM();
