# Dockerfile for React client

# Build react client
FROM node:14-alpine

# Working directory be app
WORKDIR /app

COPY package*.json ./

###  Installing dependencies

RUN npm install

# copy local files to app folder
COPY . /app

EXPOSE 3000
# ENV CHOKIDAR_USEPOLLING=true

CMD ["yarn","start"]