import React from 'react';
import styles from './HomepageFeatures.module.css';
import Feature from '../../../src/components/Feature';
import Grid from '../../../src/components/Grid';
import FooterMenu from '../../../src/components/FooterMenu';

const FeatureList = [
  {
    title: 'Get Started with Redpanda',
    image: require('../../../static/img/quickstart.png').default,
    description: (
      <>
        Try out Redpanda.
      </>
    ),
    url: '/docs/22.1/quickstart/',
  },
  {
    title: 'Deploying for Production',
    image: require('../../../static/img/deployment.png').default,
    description: (
      <>
        Install and configure Redpanda.
      </>
    ),
    url: '/docs/22.1/deployment/production-deployment',
  },
  {
    title: 'Cluster Administration',
    image: require('../../../static/img/console-docs.png').default,
    description: (
      <>
        Perform day-to-day operations in your cluster with Redpanda.
      </>
    ),
    url: '/docs/22.1/cluster-administration/',
  },
  {
    title: 'rpk Command Reference',
    image: require('../../../static/img/RPK-commands.png').default,
    description: (
      <>
        Browse all commands for running Redpanda.
      </>
    ),
    url: '/docs/22.1/reference/rpk-commands',
  },
  {
    title: 'Tiered Storage',
    image: require('../../../static/img/try-now.png').default,
    description: (
      <>
        Save storage costs by offloading log segments to the cloud.
      </>
    ),
    url: '/docs/22.1/data-management/tiered-storage',
  },
  {
    title: 'Sizing Guidelines',
    image: require('../../../static/img/get-started.png').default,
    description: (
      <>
        Size your production clusters to maximize performance.
      </>
    ),
    url: 'https://redpanda.com/blog/sizing-redpanda-cluster-best-practices',
  },
];

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <Grid gap="2rem" minWidth="300px">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </Grid>
    </section >
  );
}