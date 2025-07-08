# 🔧 API Setup Guide

This guide helps you configure all required API keys and services for the Zanos Digital Nomad platform.

## 📋 Required API Keys

### 1. **Anthropic Claude AI** (Required for Travel Advice)
- **Purpose**: Powers the TravelAI assistant for visa guidance and travel advice
- **Sign up**: https://console.anthropic.com
- **Steps**:
  1. Create an Anthropic account
  2. Navigate to API Keys section
  3. Generate a new API key
  4. Add to `.env` file: `ANTHROPIC_API_KEY="your_key_here"`

### 2. **Skyscanner API** (Optional - Uses Mock Data Otherwise)
- **Purpose**: Real flight search functionality
- **Sign up**: https://developers.skyscanner.net
- **Steps**:
  1. Create a Skyscanner developer account
  2. Request API access (may require approval)
  3. Get your API key
  4. Add to `.env` file: `SKYSCANNER_API_KEY="your_key_here"`
- **Note**: If not configured, the app uses realistic mock flight data

### 3. **Reown (WalletConnect) Project ID** (Required for Web3)
- **Purpose**: Web3 wallet connection and subscription payments
- **Sign up**: https://cloud.reown.com
- **Steps**:
  1. Create a Reown account
  2. Create a new project
  3. Copy the Project ID
  4. Add to `.env` file: `NEXT_PUBLIC_PROJECT_ID="your_project_id"`

## 🚀 Quick Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your API keys**:
   ```bash
   # Edit .env file with your actual API keys
   nano .env
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Smart Contract Deployment

The subscription system requires a deployed smart contract:

1. **Install Hardhat**:
   ```bash
   npm install -g hardhat
   npm install @nomiclabs/hardhat-ethers ethers @openzeppelin/contracts
   ```

2. **Initialize Hardhat project**:
   ```bash
   npx hardhat init
   ```

3. **Deploy contract**:
   ```bash
   # Deploy to testnet (Sepolia, Mumbai, etc.)
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Update contract address**:
   ```bash
   # Update .env with deployed contract address
   NEXT_PUBLIC_SUBSCRIPTION_CONTRACT="0xYourDeployedContractAddress"
   ```

## 🔄 Fallback Behavior

The application is designed to work even without all API keys:

- **Missing Skyscanner API**: Uses realistic mock flight data
- **Missing Anthropic API**: Travel advice features will be limited
- **Missing Reown Project ID**: Web3 features won't work
- **Mock Contract Address**: Subscription features work in demo mode

## 🧪 Testing

Run the application in development mode to test all features:

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Travel advice chat (requires Anthropic API)
- ✅ Accommodation booking (works with mock data)
- ✅ Flight search (uses mock data if no Skyscanner API)
- ✅ Web3 wallet connection (requires Reown Project ID)
- ✅ Subscription management (demo mode)

## 🚨 Important Notes

1. **Never commit API keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Monitor usage** to avoid unexpected charges
5. **Test with mock data** before adding real API keys

## 💡 Cost Optimization

- **Anthropic**: Pay per token, monitor usage
- **Skyscanner**: Check rate limits and pricing
- **Reown**: Free for development, check production pricing
- **Blockchain**: Use testnets for development to avoid gas costs

## 🆘 Troubleshooting

### Common Issues:

1. **"API key not configured" warnings**:
   - Check `.env` file exists and has correct variable names
   - Restart development server after adding keys

2. **Web3 connection fails**:
   - Verify Reown Project ID is correct
   - Check browser wallet extensions are installed

3. **Build errors**:
   - Run `npm run build` to check for TypeScript errors
   - Ensure all environment variables are properly formatted

4. **Flight search not working**:
   - Check Skyscanner API key and rate limits
   - App will fallback to mock data automatically

## 📞 Support

If you encounter issues:
1. Check console for error messages
2. Verify all environment variables are set
3. Test with mock data first
4. Refer to API provider documentation