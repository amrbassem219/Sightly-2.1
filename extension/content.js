function triggerKeyPress() {
    console.log("Triggering key press...");
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'U',
      code: 'KeyU',
      location: KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      ctrlKey: true,
      shiftKey: true
    });
    document.dispatchEvent(event);
  }

  document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Page loaded:", window.location.href);
    if (window.location.href.startsWith("https://www.vezeeta.com/*")) {
      console.log("URL matched. Triggering key press...");
      triggerKeyPress();
    }
  });
