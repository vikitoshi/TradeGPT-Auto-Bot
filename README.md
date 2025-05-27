# TradeGPT Auto Bot

An automated bot for interacting with TradeGPT Finance, performing swaps, and earning points on the 0G Testnet.

## Features ✨

- **Multi-wallet support** - Manage multiple wallets from `.env` file
- **Automated chat interactions** - Random prompts to simulate user activity
- **Token swapping** - Automated USDT to LOP swaps
- **Points tracking** - Monitor your airdrop points in real-time

## Prerequisites 📋

- Node.js v18+
- npm or yarn
- 0G Testnet USDT and native OG tokens
- Private keys (stored securely in `.env` file)

## Installation 🛠️

1. Clone the repository:
```bash
git clone https://github.com/vikitoshi/TradeGPT-Auto-Bot.git
cd TradeGPT-Auto-Bot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:
```ini
PRIVATE_KEY_1=your_private_key_here
PRIVATE_KEY_2=optional_second_private_key
# Add more as needed
```

## Configuration ⚙️

The bot comes with default settings for the 0G Testnet:

```javascript
const networkConfig = {
  rpc: 'https://evmrpc-testnet.0g.ai/',
  chainId: 16601,
  symbol: 'OG',
  explorer: 'https://chainscan-galileo.0g.ai/',
};
```

Token addresses:
- USDT: `0xe6c489B6D3eecA451D60cfda4782e9E727490477`
- LOP: `0x8b1b701966cfdd5021014bc9c18402b38091b7a8`
- Uniswap Router: `0xDCd7d05640Be92EC91ceb1c9eA18e88aFf3a6900`

## Usage 🚀

Run the bot:
```bash
node index.js
```

The bot will:
1. Display all wallet information (balances and points)
2. Ask for number of chat interactions per wallet
3. Perform random chat interactions
4. Execute random USDT to LOP swaps
5. Display updated points after completion

## Customization 🎨

You can modify:
- `getRandomPrompt()` - Add your own chat prompts
- `networkConfig` - Change RPC or chain settings
- Swap parameters - Adjust swap amounts and tokens

## Safety & Security 🔒

⚠️ **Important Security Notes**:
- Never share your private keys
- Use dedicated wallets for testing
- The bot is for testnet use only
- Review all code before running

## Support 💬

For issues or feature requests, please [open an issue](https://github.com/vikitoshi/TradeGPT-Auto-Bot/issues).

## License 📄

MIT License - See [LICENSE](LICENSE) for details.
