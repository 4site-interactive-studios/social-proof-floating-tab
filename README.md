# 4Site: Social Proof Floating Tab

A browser-based JavaScript library which displays a floating tab with customizable messages.

## Quick Start

```html
<head>
  <script type='text/javascript' src='/fsp-floating-tab.js'></script>
</head>

<body>
  <p>My main page content.</p>

  <script>
    const floatingTab = FSPFloatingTab.initialize({
      actionText: 'Give Now!',
      actionUrl: 'https://mydonationpage.com',

      messages: [
        { title: 'Donor 1 gave $100.00!', subtitle: 'Join the fight!' },
        { title: 'Donor 2 gave $50.00!', subtitle: 'Join the fight!' },
        { title: 'Donor 3 gave $150.00!', subtitle: 'Join the fight!' },
      ],

      // Optional: Enable Google Tag Manager integration.
      GTMDataLayer: window.dataLayer,

      // Optional: Enables console logging for development.
      devMode: false,
    });

    // Show the tab and start rotating messages.
    floatingTab.start();
  </script>
</body>
```

## Installing

Include the file at [`src/fsp-floating-tab.js`](src/fsp-floating-tab.js) within the `<head>` of your page.

## Configuring & Starting the Floating Tab

After the main script is included, configure and initialize it by adding an additional `<script>` tag just before the closing `</body>` tag of your page.

```html
<script>
  const floatingTab = FSPFloatingTab.initialize({
    actionText: 'Action Button Text',
    actionUrl: 'https://actionbuttonurl.com',

    messages: [
      { title: 'Message 1 Title', subtitle: 'Message 1 Subtitle' },
      { title: 'Message 2 Title', subtitle: 'Message 2 Subtitle' },
      { title: 'Message 3 Title', subtitle: 'Message 3 Subtitle' },
    ]
  });

  floatingTab.start();
</script>
```

## Floating Tab API

### `FSPFloatingTab.initialize(config)`

Initializes an instance of the floating tab.

#### Configuration Object

| Property | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `GTMDataLayer` | Object | Optional | If given, this should be [the `dataLayer` object provided by `gtm.js`](https://developers.google.com/tag-platform/tag-manager/datalayer). See [Google Tag Manager Integration](#google-tag-manager-integration) for details. |
| `actionText` | String | Required | The text of the action button. |
| `actionUrl` | String | Required | The URL to open in a new window when a user clicks the action button. |
| `devMode` | Boolean | Optional | If `true`, outputs logs to the console. |
| `messages` | Array[[Message](#message-object)] | Required | At least 2 messages to display at random. See [Message Object](#message-object) for object structure. |

##### Message Object

| Property | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `title` | String | Required | The message title. |
| `subtitle` | String | Required | The message subtitle. |

## Instance Methods

### `instance.start(options)`

Shows the floating tab.

```html
<script>
  const floatingTab = FSPFloatingTab.initialize({
    // Configuration here.
  });

  floatingTab.start({ force: true });
</script>
```

#### Options

| Property | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `force` | Boolean | Optional | If `true`, the tab will be shown even if the user recently closed it. |

### `instance.stop()`

Hides the floating tab.

```html
<script>
  const floatingTab = FSPFloatingTab.initialize({
    // Configuration here.
  });

  floatingTab.start({ force: true });

  // Once the floating tab has been started, this instance method
  // can be called at any time to hide it and stop it from appearing
  // further in the user's current session.
  floatingTab.stop();
</script>
```

## Google Tag Manager Integration

If configured (see [Configuration Object](#configuration-object)), the following events will be pushed to the GTM `dataLayer` array:

| Situation | Event |
| :-- | :-- |
| The floating tab is first shown to the user in the current session. | `floatingTabView` |
| The user clicks on the tab (except for the Close button). | `floatingTabClicked` |
| The uses clicks the Close button. | `floatingTabClosed` |

## Development

| Command | Description |
| :-- | :-- |
| `npm run dev` | Serves the example page. |
