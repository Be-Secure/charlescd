FROM node@sha256:fb256ef025424b407fb806a9828b105d82aac93c7168a1a8bc156bc82996b939

ENV APP_PATH /opt/0311-040-script

RUN mkdir -p $APP_PATH
WORKDIR $APP_PATH

ADD migration.js $APP_PATH
ADD package.json $APP_PATH

RUN npm install

ENTRYPOINT node migration.js
