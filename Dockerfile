FROM node:20.10.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm clean-install

COPY . ./

RUN npm run build

CMD [ "npm", "run", "start:prod" ]