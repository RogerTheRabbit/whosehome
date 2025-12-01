FROM node:latest

# Force check for changes so know when to rebuild
ADD "https://api.github.com/repos/RogerTheRabbit/whosehome/commits?per_page=1" latest_commit
RUN rm ./latest_commit

RUN git clone --no-checkout https://github.com/RogerTheRabbit/whosehome.git /src
WORKDIR /src
RUN git checkout main
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm", "run", "prod"]
