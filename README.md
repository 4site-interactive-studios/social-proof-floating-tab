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
    });

    // Show the tab and start rotating messages.
    floatingTab.start({ force: false });

    // Hide the tab.
    floatingTab.stop();
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
| `actionText` | String | Required | The text of the action button. |
| `actionUrl` | String | Required | The URL to open in a new window when a user clicks the action button. |
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
  floatingTab.stop();
</script>
```

## Development

| Command | Description |
| :-- | :-- |
| `npm run dev` | Serves the example page. |
