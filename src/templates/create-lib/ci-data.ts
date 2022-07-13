import type {FileWithPath} from './data'

const dockerFile: FileWithPath = ['Dockerfile',
  `FROM nginx:1.20.0-alpine as build

LABEL name="{{docker_image}}" \\
      description="Web components for headless cms" \\
      eu.mia-platform.url="https://www.mia-platform.eu" \\
      eu.mia-platform.version="1.0.0"

COPY nginx /etc/nginx

RUN touch ./off \\
  && chmod o+rw ./off \\
  && echo "{{docker_image}}: $COMMIT_SHA" >> /etc/nginx/commit.sha

WORKDIR /usr/static

COPY ./dist/{{lib_name}} .

USER nginx
`]

const gitlabCi: FileWithPath = ['.gitlab-ci.yml',
  `---

  variables:
    GIT_DEPTH: 10
    GIT_SUBMODULE_STRATEGY: recursive
    ARTIFACT_COMPRESSION_LEVEL: fastest
    CACHE_COMPRESSION_LEVEL: fastest
    FF_USE_FASTZIP: 1
  
  
  workflow:
    rules:
    - if: "$CI_COMMIT_TAG"
    - if: "$CI_COMMIT_BRANCH"
  
  default:
    retry:
      max: 1
      when:
        - runner_system_failure
        - scheduler_failure
    tags:
      - build
    services:
      - name: docker:19.03.15-dind
        alias: docker
    image: node:16-alpine
  
  stages:
    - prepare
    - test
    - post-test
    - package
  
  install-dependencies:
    stage: prepare
    script:
      - yarn set version stable
      - yarn install --immutable
    cache:
      key: "\${CI_COMMIT_REF_SLUG}"
      paths:
        - node_modules
        - .yarn
        - ./dist
    
  test:
    stage: test
    script:
      - yarn install --immutable
      - yarn lint
      - yarn coverage
    coverage: "/^Statements\\\\s*:\\\\s*([^%]+)/"
    artifacts:
      reports:
        cobertura: coverage/cobertura-coverage.xml
    cache:
      key: "\${CI_COMMIT_REF_SLUG}"
      paths:
        - node_modules
        - .yarn
        - ./dist
      policy: pull
    needs:
      - install-dependencies
  
  build:
    stage: post-test
    cache:
      - key: "\${CI_COMMIT_REF_SLUG}"
        paths:
          - node_modules
          - .yarn
          - ./dist
    script:
      - yarn install --immutable
      - yarn build
    needs:
      - install-dependencies
  
  ".docker-job":
    image: docker:stable
    stage: package
    cache:
      - key: "\${CI_COMMIT_REF_SLUG}"
        paths:
          - ./dist
        policy: pull
    variables:
      REMOTE_IMAGE_NAME: "\${NEXUS_URL}/{{docker_image}}"
      DOCKER_PATH: "."
      DOCKER_TAG: latest
      CUSTOM_BUILD_ARGS: ''
      COMMIT_SHA_FILEPATH: "/etc/nginx/commit.sha"
    script:
      - test -z "\${CI_COMMIT_TAG}" || export DOCKER_TAG=$(echo \${CI_COMMIT_TAG} | sed
        s/^v//)
      - docker login -u \${NEXUS_USER} -p \${NEXUS_TOKEN} \${NEXUS_URL}
      - docker build --build-arg COMMIT_SHA=\${CI_COMMIT_SHA} \${CUSTOM_BUILD_ARGS} --pull
        -t \${REMOTE_IMAGE_NAME}:\${DOCKER_TAG} \${DOCKER_PATH}
      - test -z "\${COMMIT_SHA_FILEPATH}" || docker run --rm \${REMOTE_IMAGE_NAME}:\${DOCKER_TAG}
        cat \${COMMIT_SHA_FILEPATH}
      - docker push \${REMOTE_IMAGE_NAME}:\${DOCKER_TAG}
    needs:
      - build
  
  build-docker:
    extends: 
      - ".docker-job"
    rules:
      - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      - if: $CI_COMMIT_TAG
`]

export default [
  dockerFile,
  gitlabCi
]
