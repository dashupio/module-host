Dashup Module Host
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-host.svg)](https://github.com/dashup/module-host/releases/latest)
=====

A connect interface for host on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This host connector adds hosts functionality to Dashup hosts:

```json
{
  "url" : "https://dashup.io",
  "key" : "[dashup module key here]"
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-host .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-host`