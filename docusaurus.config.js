const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const variableInjector = require('./src/remark/variable-replacer');
const getLatestRedpandaReleaseVersion = require('./src/remark/GetLatestRedpandaVersion');
const getLatestConsoleReleaseVersion = require('./src/remark/GetLatestConsoleVersion');
const redirectsPlugin = require('./src/remark/parseRedirects');

const isProd = process.env.GITHUB_TOKEN;

module.exports = async () => {
  // Await the latest release version from GitHub
  const {latestRedpandaReleaseVersion,latestRedpandaReleaseCommitHash} = isProd ? await getLatestRedpandaReleaseVersion() : {undefined,undefined}
  const latestConsoleReleaseVersion = isProd ? await getLatestConsoleReleaseVersion() : undefined

  const config = {
    title: 'Redpanda Docs',
    tagline: 'A modern streaming platform for mission critical workloads',
    url: 'https://docs.redpanda.com',
    baseUrl: '/',
    trailingSlash: 'true',
    favicon: 'img/Redpanda_Favicon_32px.svg',
    organizationName: 'redpanda-data', // Usually your GitHub org/user name.
    projectName: 'redpanda', // Usually your repo name.,
    themeConfig: {
      colorMode: {
        disableSwitch: false
      },
      navbar: {
        title: '',
        hideOnScroll: true,
        logo: {
          alt: 'Redpanda Logo',
          src: 'img/redpanda-docs-logo.svg',
          srcDark: 'img/redpanda-docs-logo.svg',
          href: '/'
        },
        items: [
          { href: 'https://redpanda.com/', label: 'Redpanda.com', position: 'right', target: '_self' },
          { href: 'https://redpanda.com/resources/', label: 'Resources', position: 'right', target: '_self' },
          { href: 'https://university.redpanda.com/', label: 'Training', position: 'right', target: '_self' },
          { href: 'https://redpanda.com/blog/', label: 'Blog', position: 'right', target: '_self' },
          { href: 'https://github.com/redpanda-data/redpanda/', label: 'GitHub', position: 'right', target: '_self' },
          {
            type: 'dropdown',
            label: 'Contact',
            position: 'right',
            items: [
              {
                label: 'Request demo',
                href: 'https://redpanda.com/contact',
              },
              {
                label: 'Join our Slack',
                href: 'https://redpanda.com/slack',
              },

              {
                label: 'Support request',
                href: 'https://support.redpanda.com/hc/en-us/',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'Redpanda Logo',
          src: 'img/redpanda-logo.svg',
          srcDark: 'img/redpanda-logo.svg',
          href: 'https://redpanda.com/'
        },
        links: [
          {
          }
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'java','scala','yaml','docker','powershell','git', 'ini', 'properties', 'javascript', 'python']
      },
      algolia: {
        // The application ID provided by Algolia
        appId: '6YUV7845VT',

        // Public API key: it is safe to commit it
        apiKey: '2639b1b6c05670f52200b301c84866d9',

        indexName: 'redpanda',

        // Optional: see doc section below
        contextualSearch: true,

      },
    },
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl: ({versionDocsDirPath, docPath}) =>
              `https://github.com/redpanda-data/documentation/edit/dev/${versionDocsDirPath}/${docPath}`,
            editLocalizedFiles: false,
            editCurrentVersion: false,
            routeBasePath: 'docs',
            include: ['**/*.md', '**/*.mdx'],
            exclude: [
              '**/_*.{js,jsx,ts,tsx,md,mdx}',
              '**/_*/**',
              '**/*.test.{js,jsx,ts,tsx}',
              '**/__tests__/**',
            ],
            lastVersion: 'current',
            versions: {
              current: {
                label: '23.2',
              },
              "21.11": {
                banner:'unmaintained'
              },
              "22.1": {
                banner:'unmaintained'
              },
            },
            beforeDefaultRemarkPlugins: [
                [variableInjector, {
                  // Declare global variables here.
                  // Note: Do not use global variables in front matter.
                  //       Docusaurus does not support it.
                  //       To track progress on this limitation,
                  //       see: https://github.com/facebook/docusaurus/issues/5568
                  replacements: {
                    // The latest release data is fetched from GitHub in ./src/remark/GetLatestRedpandaVersion
                    // and ./src/remark/GetLatestConsoleVersion.
                    // The fallback version to the right of the pipes (||)
                    // is used in cases where the version cannot be fetched from GitHub.
                    // You can assign the latest release data to any variable.
                    REDPANDA_VERSION_23_1: latestRedpandaReleaseVersion || '23.1.1',
                    REDPANDA_SHA_23_1: latestRedpandaReleaseCommitHash || '92761c3',
                    REDPANDA_VERSION_22_3: '22.3.11',
                    REDPANDA_SHA_22_3: '9eefb907c',
                    // Always use the latest version of Redpanda Console
                    CONSOLE_LATEST_VERSION: latestConsoleReleaseVersion || '2.2.2',
                    // You can define any custom variables here.
                    // Variable names must include only the following characters:
                    // A-Z, 0-9, and underscores (_)
                    REDPANDA_VERSION_22_2: '22.2.9'
                  }
                }]
              ],
            },
            blog: {
              showReadingTime: true,
            },
            theme: {
              customCss: require.resolve('./src/css/custom.css'),
            },
            sitemap: {
              changefreq: 'weekly',
            },
          },
        ],
        [
          'redocusaurus',
          {
            // Plugin Options for loading OpenAPI files
            specs: [
              {
                spec: 'static/api/pandaproxy-schema-registry.json',
                route: '/docs/api/pandaproxy-schema-registry',
              },
              {
                spec: 'static/api/pandaproxy-rest.json',
                route: '/docs/api/pandaproxy-rest',
              },
              {
                spec: 'static/api/admin-api.yaml',
                route: '/docs/api/admin-api',
              },
            ],
          },
        ],
      ],
      plugins: [
        redirectsPlugin,
        function (context, options) {
          return {
            name: 'docusaurus-plugin',
            injectHtmlTags({content}) {
              return {
                headTags:['<meta name="google-site-verification" content="QcL-pD81oJatgKXQ3Wquvk_Ku3RRtUljxKoMaicySQA" />'],
                preBodyTags: [`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WB2CSV5" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><script type="text/javascript"> 
                window._mfq = window._mfq || []; 
                (function() { 
                   var mf = document.createElement("script"); mf.type = "text/javascript"; mf.defer = true; 
                   mf.src = "//cdn.mouseflow.com/projects/4260ac2a-9c53-42f1-a6cf-c2942fbfc263.js"; 
                   document.getElementsByTagName("head")[0].appendChild(mf); 
                })(); 
             </script>`],
              };
            },
          }
        },
      ],
      scripts: [
        {
          src: '/js/googletag.js',
          async: false,
        },
        {
          src:'https://plausible.io/js/plausible.js',
          defer: true,
          'data-domain': "redpanda.com",
  
        }
      ],
      stylesheets: [
        "https://fonts.googleapis.com/icon?family=Material+Icons",
      ],
    }
  return config
}
