# pull official base image
FROM node:14.17.6-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --silent
# RUN yarn global add react-scripts@3.4.1 --silent

# add app
COPY . /app

EXPOSE 3000
# start app
CMD ["yarn", "start"]