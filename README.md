[![Slack](https://img.shields.io/badge/slack-purple)](https://redpanda.com/slack)
[![Twitter](https://img.shields.io/twitter/follow/redpandadata.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=redpandadata)
[![Netlify Status](https://api.netlify.com/api/v1/badges/5b89dd6f-1847-419c-b3be-a1650ce8992f/deploy-status)](https://app.netlify.com/sites/redpanda-documentation/deploys)

<p>
<a href="https://docs.redpanda.com">
<object type="image/svg+xml">
  <img src="static\img\redpanda-docs-logo.svg"/>
</object>
</p></a>


This repository hosts the source code and content for the Redpanda documentation website. 

The source code for the Redpanda product is hosted in the [Redpanda product repository](https://github.com/redpanda-data/redpanda). 

# Website

This website is served at https://docs.redpanda.com

## Local Development

This website is using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

If you want to run the website locally, install the packages:

```bash
npm install
```

Then you'll be able to start: 

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

To have a production ready build run:

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Hosting

This website is hosted at [Netlify](https://www.netlify.com/).

# Style Guide
Before you add or edit content, consult the Redpanda [Style Guide](./meta_docs/style_guide.md) for product documentation guidelines.

## Single-sourcing with partials

Practice the DRY (Don't Repeat Yourself) principle by [single-sourcing repeated content](./meta_docs/single_sourcing.md). Common examples of single-sourced content include prerequisites, contact info, and foundational steps of how-to guides.