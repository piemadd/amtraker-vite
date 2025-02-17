import { Popup } from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

const activatePopup = (mapRef, component, popup) => {
  const div = document.createElement('div');
  const root = createRoot(div);
  flushSync(() => {
    root.render(component);
  });

  popup
    .setDOMContent(div)
    .addTo(mapRef.current);
};

export default activatePopup;