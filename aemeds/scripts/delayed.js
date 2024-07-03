// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const searchParams = new URLSearchParams(window.location.search);
if (window.location.pathname === '/blogs/2023/ai-business-process-analyst-role'
  && searchParams.get('loadLaunch') === 'delayed') {
  // eslint-disable-next-line no-undef
  loadAdobeDTM();
}
