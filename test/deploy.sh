#/bin/bash
set -e
ORG=${ORG:-hsldevcom}
yarn install

docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
wget -N http://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
CHROMEDRIVER=./chromedriver test/flow/script/run-flow-tests.sh
RESULT=$?
if [ $RESULT -eq 0 ]; then
  echo "Pushing to docker"
  if [[ "$TRAVIS_BRANCH" = "master" && "$TRAVIS_PULL_REQUEST" = "false" ]]; then
      docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
      docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/digitransit-ui:latest
      docker push $ORG/digitransit-ui:latest
  fi
fi
exit $RESULT
