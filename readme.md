# AI Assistant for finding github issues that can be closed

This is a simple AI assistant that uses Anthropic's Claude API to find github issues that can be closed.

It uses a series of JSON files that are loaded from the `data` directory.

## Setup
```bash
# install dependencies
npm install

# copy .env.sample to .env and set the correct environment variables
cp .env.sample .env

# load data
npm run load-data

# analyze data
npm run analyze
```