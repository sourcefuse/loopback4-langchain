# Basic AI Agent Example

This example application demonstrates how to use the `loopback4-langchain` extension to integrate LangChain capabilities into a LoopBack 4 application.

## 🧩 Overview

The Basic AI Agent example shows how to:

- Set up a LoopBack 4 application with the LangChain extension
- Configure the LangChain service with Groq LLM provider
- Create custom tools for the LLM to use
- Build a simple REST API that leverages AI capabilities

## 🚀 Prerequisites

- Node.js (v18 or later)
- npm (v7 or later)
- Groq API key (get one from [groq.com](https://console.groq.com/))

## 🛠️ Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Set up environment variables:

   ```sh
   # Create a .env file in the root of the example
   echo "GROQ_API_KEY=your_api_key_here" > .env
   ```

3. Build the application:
   ```sh
   npm run build
   ```

## 🏃‍♂️ Running the Application

Start the application:

```sh
npm start
```

The server will start on http://127.0.0.1:3000

## 📝 API Endpoints

- `GET /ping`: Basic health check endpoint

## 🧠 How It Works

This example demonstrates a basic setup of the `loopback4-langchain` extension. The application:

1. Imports the `LangChainComponent` in the application class
2. Configures the LangChain service with options
3. Provides a simple REST API for interacting with the LLM

## 🔧 Customizing the Example

To extend this example:

1. Create custom tools by implementing the `Tool` interface
2. Add new controllers that use the LangChain service
3. Experiment with different LLM models and parameters

## 📚 Learn More

- [LoopBack 4 Documentation](https://loopback.io/doc/en/lb4/)
- [LangChain JS Documentation](https://js.langchain.com/docs/)
- [Groq Documentation](https://console.groq.com/docs)

## 🤝 Contributing

Please see the main project's [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on how to contribute.

## 📜 License

ISC
