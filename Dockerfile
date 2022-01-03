FROM alpine


RUN apk add --update nodejs npm
RUN apk --no-cache add git

WORKDIR /home

RUN git clone https://github.com/Adamant-im/adamant-console/ #fetching code from github

RUN cd adamant-console && npm install  && chmod a+x index.js 

RUN ln -s ~/adamant-console/index.js /usr/bin/adm #create symlink. make sure you set correct path to index.js

RUN cd adamant-console && cp config.default.json config.json

# meaningless command but util: change to repull git every time

ARG CACHEBUST=10

RUN cd adamant-console && sed 's/"network": "testnet"/"network": "mainnet"/' config.default.json > temp.json

RUN cd adamant-console && sed 's/"passPhrase": ""/"passPhrase": "web robust essay envelope scrub often salute afraid ethics ancient gown quick"/' temp.json > config.default.json

RUN git clone https://github.com/kingridda/blockchain-based-2FA-demo.git 

RUN cd blockchain-based-2FA-demo && npm install #installing dependencies

RUN cd blockchain-based-2FA-demo && chmod a+x index.js #making executable


EXPOSE 5080
EXPOSE 3000

 
CMD [ "node", "blockchain-based-2FA-demo/index.js" ]
