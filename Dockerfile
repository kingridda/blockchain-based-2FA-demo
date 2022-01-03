FROM node:16

RUN apt update

WORKDIR /home

RUN git clone https://github.com/Adamant-im/adamant-console/ #fetching code from github

RUN cd adamant-console

RUN npm install #installing dependencies

RUN chmod a+x index.js #making executable

RUN ln -s ~/adamant-console/index.js /usr/bin/adm #create symlink. make sure you set correct path to index.js

RUN cp config.default.json config.json

RUN sed 's/testnet/mainnet/' config.default.json > config.json

RUN sed 's/"passPhrase":/"passPhrase": "web robust essay envelope scrub often salute afraid ethics ancient gown quick"/' config.json > config.default.json

COPY blockchain-based-2FA-demo /home/

RUN cd /home/blockchain-based-2FA-demo

RUN node index.js 
 
EXPOSE 5080