# Next.js viem dstack Template

## Requirements
- Node >= v18.18
- yarn
- Docker or Orbstack

## Getting Started

First, run the TEE Attestation Simulator:

```bash
docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:v0.0.1
```

Next, download the dependencies with `yarn`

```shell
yarn
```

Build the docker image
```shell
docker build -t nextjs-viem-dstack-template .
```

After the build is successful, run your docker image to connect to the TEE Attestation Simulator
> NOTE: Your docker image hash will be different than the one listed below.
```shell
docker run --rm -p 3000:3000 61a7efb8f25c
```

