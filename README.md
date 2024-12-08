# ETH-Tracker

ETH-Tracker is a Discord bot that allows users to track Ethereum accounts in real-time by providing their public keys. The bot sends updates about transactions from the tracked accounts directly to the user's Discord channel.

---

## Features

- **Account Tracking:** Users can provide a public Ethereum key to track transactions.
- **Real-time Notifications:** Receive updates about incoming and outgoing transactions on the specified accounts.
- **Scalable Architecture:** Built with a microservice approach using Kafka for seamless communication between components.
- **Persistent Storage:** Stores tracked account data in PostgreSQL for reliability and easy retrieval.

---

## Technology Stack

- **Frontend**: Discord.js for interacting with Discord APIs.
- **Backend**:
  - **Turborepo**: Manages the monorepo setup for efficient development.
  - **Kafka**: Message broker for connecting the scraper and the bot.
  - **TypeScript**: Provides type safety and modern JavaScript features.
- **Database**: PostgreSQL for storing tracked account data.

---

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Kafka
- Discord Bot Token

### Steps to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayush272002/ETH-Tracker.git
   cd ETH-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the respective directories with the variables mentioned in `.env.example`

4. **Start PostgreSQL and Kafka:**
   Make sure your PostgreSQL and Kafka instances are up and running.

5. **Run the bot:**
   ```bash
   npm run dev
   ```

---

## Usage

1. **Add the bot to your server:**
   Invite the bot to your Discord server using the invite link generated for your bot.

2. **Start tracking an account:**
   Use the bot command to start tracking a public Ethereum account key:
   ```
   \watch <public-key>
   ```

3. **Receive updates:**
   The bot will notify you in the same channel whenever there is a new transaction on the tracked account.

4. **Stop tracking an account:**
   Use the bot command to stop tracking a specific account:
   ```
   \unwatch <public-key>
   ```

---

## Directory Structure

```plaintext
ETH-Tracker/
├── .github/               # GitHub configuration files
├── .husky/                # Git hooks for maintaining code quality
├── apps/                  # Applications
│   ├── bot/               # Discord bot logic
│   └── scrapper/          # Scraper service for Ethereum transactions
├── packages/              # Shared packages and configurations
│   ├── db/                # Database schema and utilities
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── kafka/             # Kafka setup and utilities
│   ├── topics/            # Kafka topics definitions
│   └── typescript-config/ # Shared TypeScript configuration
├── .gitignore             # Git ignore rules
├── .npmrc                 # npm configuration file
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Lockfile for npm dependencies
├── prettier.config.js     # Prettier configuration
├── turbo.json             # Turborepo configuration
└── README.md              # Project documentation

```