# Embed Portal

Embed Portal is a lightweight custom element that allows you to fetch external HTML and inject it directly into a Shadow DOM.

While it functions similarly to an `<iframe>`, using a Shadow DOM keeps the embedded content encapsulated within the light DOM's styling and structure without the overhead or isolation constraints of a full iframe.

## Why Use It?

- Encapsulation: Styles defined in the parent document won't leak into the portal (and vice versa).
- Performance: Avoids the heavy resource usage associated with loading multiple independent browser contexts (iframes).
- Seamless Integration: Allows you to fetch and display modular components or partial pages dynamically.

## Installation

Add this script to your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/tkdeng/embed-portal/style.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/tkdeng/embed-portal/script.min.js" defer></script>
```

## Usage

Simply use the `<embed-portal>` tag in your HTML:

```html
<embed-portal src="/embed-shadow-dom"></embed-portal>
```

### Handling Events

You can react to the portal's lifecycle using standard event listeners:

```js
const portal = document.querySelector('embed-portal');

// Handle successful load
portal.addEventListener('load', (event) => {
  console.log('Portal content injected successfully!');

  // Access the shadow root directly from the event
  const shadowRoot = event.detail.root;
});

// Handle errors
portal.addEventListener('error', (event) => {
  console.error('Failed to load portal:', event.detail.message);
});

// Global listener
document.addEventListener('load-embed-portal', (event) => {
  const shadowRoot = event.detail.root;
  const target = event.detail.target; // portal element
});
```

## Attributes

| Attribute | Description |
| --------- | ----------- |
| src | The URL of the HTML content to embed (must be same-origin). |
| noscript | Optional. If present, prevents the script from attempting to extract and execute `<script>` tags from the fetched content. |
| onload | Optional. A string containing JavaScript to execute once the content has been successfully injected. |

## How It Works

1. Polling: The script periodically scans the DOM for new `<embed-portal>` elements.
2. Fetching: It performs a GET request to the provided src with a custom X-Fetch-Dest: embed-portal header.
3. Parsing: It extracts `<link>` stylesheets and `<style>` blocks from the document head and injects them into the Shadow DOM to preserve styling.
4. Injection: It extracts the `<body>` content and appends it into the shadow root.
5. Events: Once loaded, it dispatches a custom `load` event containing the `shadow` root in the `detail` object (or `error` if the request fails).

## Technical Notes

- Security: This implementation enforces same-origin requests to prevent CORS issues. Invalid requests trigger an `error` event and log a sanitized URL to the console.
- Script Handling: By default, it attempts to extract and register scripts from the fetched page to the main document head. You can disable this with the `noscript` attribute.
