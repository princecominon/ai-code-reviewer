# 1. Grab a tiny, pre-configured Linux computer that already has Node 20 installed.
FROM node:20-alpine

# 2. Inside that virtual computer, create a folder named "/app" and go inside it.
WORKDIR /app

# 3. Copy ONLY your package.json files from your real computer into the virtual one first.
COPY package*.json ./

# 4. Tell the virtual computer to download and install all the required packages (like octokit, google/genai).
RUN npm install --omit=dev

# 5. Now that packages are installed, copy all your actual code (index.js, etc.) into the virtual computer.
COPY . .

# 6. Tell the virtual computer: "When someone turns you on, immediately run this command."
ENTRYPOINT ["node", "index.js"]