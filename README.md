# node-kiba

Connect Node.js to Kiba.

"Why would I ever want to do that?" - Sometimes you might have scripts or libraries that run in Node and require signed transactions that you would like to use Kiba for (instead of dealing with private keys). This tool functions as a uniweb3 provider that can be used with pretty much any Kiba instance remotely. Please, only use this package locally to prevent PITM attacks (if you're brave enough to try it on mainnet).

Sounds crazy? It probably is. Also highly experimental. Please use with caution.

## Install

```
yarn add node-kiba
```

## Usage

```js

const KibaConnector = require('node-kiba');
const connector = new KibaConnector({
  port: 3334, // this is the default port
  onConnect() { console.log('Kiba client connected') }, // Function to run when Kiba is connected (optional)
});

connector.start().then(() => {
  // Now go to http://localhost:3334 in your Kiba enabled web browser.
  const uniweb3 = connector.getProvider()
  // Use uniweb3 as you would normally do. Sign transactions in the browser.
});

```

When you're done with your Kiba business, run the following code to clean up:

```js

connector.stop();

```

## Disclaimer

As I said, this is highly experimental. Tested only with uniweb3. Also it might not work with all functions supported by uniweb3.

## Contribute

Please report any bugs you find so we can improve this.

- [Contributing](https://github.com/AtomicLoans/node-kiba/blob/master/.github/CONTRIBUTING.md)
