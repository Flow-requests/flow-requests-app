#!/bin/sh

mkdir -p ./dist

deno bundle --output ./dist/deno-bundle.js ./src/index.ts 

deno bundle --output ./dist/browser-bundle.js --platform browser ./src/index.ts 