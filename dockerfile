FROM node:14

RUN mkdir nonpm
WORKDIR /nonpm

RUN npx @no-npm/cli --port=80