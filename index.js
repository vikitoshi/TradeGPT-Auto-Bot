require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const prompt = require('prompt-sync')();

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m"
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`---------------------------------------------`);
    console.log(`  TradeGPT Auto Bot - Airdrop Insiders  `);
    console.log(`---------------------------------------------${colors.reset}`);
    console.log();
  }
};

const getRandomUserAgent = () => {
  const userAgents = [
    '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
    '"Chromium";v="128", "Google Chrome";v="128", "Not.A/Brand";v="24"',
    '"Firefox";v="126", "Gecko";v="20100101"',
    '"Safari";v="17.0", "AppleWebKit";v="605.1.15", "Not.A/Brand";v="8"',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const getRandomPrompt = () => {
  const prompts = [
    "What's the value of my portfolio?",
    "What can I do on TradeGPT?",
    "What is the price of SLJD?",
    "Perform initial analysis of the users wallet",
    "Can you check my recent transactions?",
    "What are the top tokens to watch today?",
    "Need alpha",
    "How's my wallet performance?",
    "Any new trading opportunities?",
    "What are the trending markets today?",
    "Can you suggest a trading strategy?",
    "What is the price of LOP?",
    "Show me my transaction history",
    "Are there any upcoming airdrops?",
    "What tokens should I hold for the long term?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

const loadPrivateKeys = () => {
  const privateKeys = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('PRIVATE_KEY_') && value) {
      privateKeys.push(value);
    }
  }
  return privateKeys;
};

const networkConfig = {
  rpc: 'https://evmrpc-testnet.0g.ai/',
  chainId: 16601,
  symbol: 'OG',
  explorer: 'https://chainscan-galileo.0g.ai/',
};

const uniswapRouterAddress = '0xDCd7d05640Be92EC91ceb1c9eA18e88aFf3a6900'; 
const usdtAddress = '0xe6c489B6D3eecA451D60cfda4782e9E727490477';
const lopAddress = '0x8b1b701966cfdd5021014bc9c18402b38091b7a8'; 
const uniswapRouterABI = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
];

const erc20ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const getHeaders = () => ({
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'sec-ch-ua': getRandomUserAgent(),
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'sec-gpc': '1',
  'Referer': 'https://0g.app.tradegpt.finance/',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

async function fetchWalletPoints(walletAddress) {
  const url = `https://trade-gpt-800267618745.herokuapp.com/points/${walletAddress.toLowerCase()}`;
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch points for wallet ${walletAddress}: ${error.message}`);
    return null;
  }
}

async function checkWalletInfo(wallet, provider, walletAddress) {
  try {
    const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, provider);
    const nativeBalance = await provider.getBalance(walletAddress);
    const usdtBalance = await usdtContract.balanceOf(walletAddress);
    const usdtDecimals = await usdtContract.decimals();
    const pointsData = await fetchWalletPoints(walletAddress);

    return { usdtBalance, usdtDecimals, nativeBalance, pointsData };
  } catch (error) {
    logger.error(`Failed to fetch wallet info for ${walletAddress}: ${error.message}`);
    throw error;
  }
}

async function displayAllWalletInfo(privateKeys, provider) {
  for (const privateKey of privateKeys) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const walletAddress = wallet.address;
      const { usdtBalance, usdtDecimals, nativeBalance, pointsData } = await checkWalletInfo(wallet, provider, walletAddress);

      logger.info(`Wallet Information for ${walletAddress}:`);
      logger.info(`Native (OG): ${ethers.formatEther(nativeBalance)} OG`);
      logger.info(`USDT: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
      if (pointsData) {
        logger.info(`Points: ${pointsData.totalPoints} (Mainnet: ${pointsData.mainnetPoints}, Testnet: ${pointsData.testnetPoints}, Social: ${pointsData.socialPoints})`);
        logger.info(`Last Updated: ${new Date(pointsData.lastUpdated).toISOString()}`);
      } else {
        logger.warn(`No points data available for wallet ${walletAddress}`);
      }
      console.log('');
    } catch (error) {
      logger.error(`Failed to display info for wallet: ${error.message}`);
    }
  }
}

async function sendChatRequest(walletAddress, prompt) {
  const url = 'https://trade-gpt-800267618745.herokuapp.com/ask/ask';
  const payload = {
    chainId: networkConfig.chainId,
    user: walletAddress,
    questions: [
      {
        question: prompt,
        answer: '',
        baseMessage: {
          lc: 1,
          type: 'constructor',
          id: ['langchain_core', 'messages', 'HumanMessage'],
          kwargs: { content: prompt, additional_kwargs: {}, response_metadata: {} },
        },
        type: null,
        priceHistorical: null,
        priceHistoricalData: null,
        isSynchronized: false,
        isFallback: false,
      },
    ],
    testnetOnly: true,
  };

  try {
    logger.loading(`Sending chat request for wallet ${walletAddress}: "${prompt}"`);
    const response = await axios.post(url, payload, { headers: getHeaders() });
    logger.info(`Chat request successful for wallet ${walletAddress}: ${prompt}`);
    return response.data;
  } catch (error) {
    logger.error(`Chat request failed for wallet ${walletAddress}: ${error.message}`);
    throw error;
  }
}

async function performSwap(wallet, provider, amountUSDT, walletAddress) {
  try {
    const { usdtBalance, usdtDecimals, nativeBalance } = await checkWalletInfo(wallet, provider, walletAddress);
    const amountIn = ethers.parseUnits(amountUSDT.toString(), usdtDecimals);

    if (usdtBalance < amountIn) {
      throw new Error(`Insufficient USDT balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
    }
    if (nativeBalance < ethers.parseEther('0.001')) {
      throw new Error(`Insufficient OG balance for gas: ${ethers.formatEther(nativeBalance)} OG`);
    }

    const path = [usdtAddress, lopAddress]; 
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; 

    const url = 'https://trade-gpt-800267618745.herokuapp.com/ask/ask';
    const payload = {
      chainId: networkConfig.chainId,
      user: walletAddress,
      questions: [
        {
          question: `Swap ${amountUSDT} USDT to LOP`,
          answer: '',
          baseMessage: {
            lc: 1,
            type: 'constructor',
            id: ['langchain_core', 'messages', 'HumanMessage'],
            kwargs: { content: `Swap ${amountUSDT} USDT to LOP`, additional_kwargs: {}, response_metadata: {} },
          },
          type: null,
          priceHistorical: null,
          priceHistoricalData: null,
          isSynchronized: false,
          isFallback: false,
        },
      ],
      testnetOnly: true,
    };

    logger.loading(`Fetching swap details for ${amountUSDT} USDT to LOP`);
    const response = await axios.post(url, payload, { headers: getHeaders() });
    const swapData = JSON.parse(response.data.questions[0].answer[0].content);

    if (!swapData.amountOutMin) {
      throw new Error('Invalid swap data: amountOutMin is undefined');
    }

    const amountOutMin = ethers.parseUnits(swapData.amountOutMin.toString(), 18); 

    const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, wallet);
    logger.loading(`Approving USDT for Uniswap Router for wallet ${walletAddress}`);
    const approveTx = await usdtContract.approve(uniswapRouterAddress, amountIn, { gasLimit: 100000 });
    await approveTx.wait();
    logger.info(`USDT approval successful for wallet ${walletAddress}`);

    const router = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, wallet);
    logger.loading(`Initiating swap of ${amountUSDT} USDT to LOP for wallet ${walletAddress}`);
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      walletAddress,
      deadline,
      { gasLimit: 200000 }
    );

    logger.loading(`Waiting for transaction confirmation: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Swap successful! Tx Hash: ${tx.hash}`);

    const logResponse = await logTransaction(walletAddress, amountUSDT, receipt.transactionHash);
    logger.success(`Transaction logged successfully: - [✓] "status": "${logResponse.data.status}"`);

    return receipt;
  } catch (error) {
    logger.error(`Swap failed for wallet ${walletAddress}: ${error.message}`);
    if (error.transaction) {
      logger.error(`Transaction details: ${JSON.stringify(error.transaction, null, 2)}`);
    }
    if (error.receipt) {
      logger.error(`Receipt details: ${JSON.stringify(error.receipt, null, 2)}`);
    }
    throw error;
  }
}

async function logTransaction(walletAddress, amountUSDT, txHash) {
  const url = 'https://trade-gpt-800267618745.herokuapp.com/log/logTransaction';
  const payload = {
    walletAddress,
    chainId: networkConfig.chainId,
    txHash,
    amount: amountUSDT.toString(),
    usdValue: amountUSDT,
    currencyIn: 'USDT',
    currencyOut: 'LOP',
    timestamp: Date.now(),
    timestampFormatted: new Date().toISOString(),
  };

  try {
    logger.loading(`Logging transaction ${txHash}`);
    const response = await axios.post(url, payload, { headers: getHeaders() });
    return response;
  } catch (error) {
    logger.error(`Failed to log transaction ${txHash}: ${error.message}`);
    throw error;
  }
}

async function runBot() {
  logger.banner();

  const privateKeys = loadPrivateKeys();
  if (privateKeys.length === 0) {
    logger.warn('No private keys found in .env file. Exiting...');
    return;
  }

  const provider = new ethers.JsonRpcProvider(networkConfig.rpc);

  await displayAllWalletInfo(privateKeys, provider);

  const numPrompts = parseInt(prompt('Enter the number of random chat prompts to send per wallet: '));
  if (isNaN(numPrompts) || numPrompts < 1) {
    logger.error('Invalid number of prompts. Exiting...');
    return;
  }

  for (const privateKey of privateKeys) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const walletAddress = wallet.address;
      logger.step(`Processing wallet: ${walletAddress}`);

      for (let i = 0; i < numPrompts; i++) {
        const randomPrompt = getRandomPrompt();
        await sendChatRequest(walletAddress, randomPrompt);

        const randomAmount = (Math.random() * (1 - 0.1) + 0.1).toFixed(6);
        const swapPrompt = `Swap ${randomAmount} USDT to LOP`;
        await sendChatRequest(walletAddress, swapPrompt);
        await performSwap(wallet, provider, randomAmount, walletAddress);

        await new Promise(resolve => setTimeout(resolve, 2000)); 
      }
    } catch (error) {
      logger.error(`Error processing wallet: ${error.message}`);
    }
  }

  logger.success('Bot execution completed');
  for (const privateKey of privateKeys) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const walletAddress = wallet.address;
      const pointsData = await fetchWalletPoints(walletAddress);
      if (pointsData) {
        logger.info(`Points for ${walletAddress}: (Mainnet: ${pointsData.mainnetPoints}, Testnet: ${pointsData.testnetPoints}, Social: ${pointsData.socialPoints})`);
      } else {
        logger.warn(`No points data available for wallet ${walletAddress}`);
      }
    } catch (error) {
      logger.error(`Failed to fetch updated points: ${error.message}`);
    }
  }
}

runBot().catch(error => logger.error(`Bot failed: ${error.message}`));