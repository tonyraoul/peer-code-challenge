FROM node:8
WORKDIR /usr/src/app
COPY . .
RUN npm install
Run ./store.js add a 1
Run ./store.js list