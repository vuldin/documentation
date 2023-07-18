import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import {
  useActivePlugin,
  useDocVersionSuggestions,
} from '@docusaurus/plugin-content-docs/client';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  useDocsPreferredVersion,
  useDocsVersion,
} from '@docusaurus/theme-common/internal';
import useGlobalData from '@docusaurus/useGlobalData';
import {useLocation} from '@docusaurus/router';

function UnreleasedVersionLabel({siteTitle, versionMetadata}) {
  return (
    <Translate
      id="theme.docs.versions.unreleasedVersionLabel"
      description="The label used to tell the user that he's browsing an unreleased doc version"
      values={{
        siteTitle,
        versionLabel: <b>{versionMetadata.label}</b>,
        releaseAnnouncement: (
           <span>
            See the announcement for <b>{versionMetadata.label}</b> in <a href="https://redpandacommunity.slack.com/archives/C01AXCBCC2Y/p1685637636029149">Redpanda Community</a>.
          </span>
        ),
        upgradeNotice: (
          <p>
            <br/>
           Upgrading from beta to production is not supported.
         </p>
       ),
      }}>
      {
        'This is in-progress documentation for Redpanda {versionLabel}. {releaseAnnouncement} {upgradeNotice}'
      }
    </Translate>
  );
}
function UnmaintainedVersionLabel({versionMetadata}) {
  return (
    <Translate
      id="theme.docs.versions.unmaintainedVersionLabel"
      description="The label used to tell the user that he's browsing an unmaintained doc version"
      values={{
        versionLabel: <b>{versionMetadata.label}</b>,
      }}>
      {
        'This is the documentation for Redpanda v{versionLabel}, which is no longer supported.'
      }
    </Translate>
  );
}
const BannerLabelComponents = {
  unreleased: UnreleasedVersionLabel,
  unmaintained: UnmaintainedVersionLabel,
};
function BannerLabel(props) {
  const BannerLabelComponent =
    BannerLabelComponents[props.versionMetadata.banner];
  return <BannerLabelComponent {...props} />;
}
function LatestVersionSuggestionLabel({versionLabel, to, onClick}) {
  return (
    <Translate
      id="theme.docs.versions.latestVersionSuggestionLabel"
      description="The label used to tell the user to check the latest version"
      values={{
        versionLabel,
        latestVersionLink: (
          <b>
            <Link to={to} onClick={onClick}>
              <Translate
                id="theme.docs.versions.latestVersionLinkLabel"
                description="The label used for the latest version suggestion link label">
                latest version
              </Translate>
            </Link>
          </b>
        ),
      }}>
      {
        'For up-to-date documentation, see the {latestVersionLink} ({versionLabel}).'
      }
    </Translate>
  );
}
function DocVersionBannerEnabled({className, versionMetadata}) {
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const {pluginId} = useActivePlugin({failfast: true});
  const getVersionMainDoc = (version) =>
    version.docs.find((doc) => doc.id === version.mainDocId);
  const {savePreferredVersionName} = useDocsPreferredVersion(pluginId);
  const {latestDocSuggestion, latestVersionSuggestion} =
    useDocVersionSuggestions(pluginId);

  const location = useLocation();
  const globalData = useGlobalData();
  const redirects = globalData['parse-redirects-plugin']['default']['redirects'];
  var latestVersionSuggestedDoc;
  var mainDoc;
  const locationPath = location.pathname;
  var latestLocationPath = locationPath.replace(/\d+\.\d+\/\s?/g, '')
  latestLocationPath = latestLocationPath.replace(/\/$/, '');

  if (latestDocSuggestion) {
    latestVersionSuggestedDoc = latestDocSuggestion.path;
  } else {
    if (redirects[latestLocationPath]) {
      // Max iterations in a redirect chain/loop
      var iter = 8;
      do {
        latestVersionSuggestedDoc = redirects[latestLocationPath];
        latestLocationPath = latestVersionSuggestedDoc;

        //console.log("Iterate: %s -> %s", latestVersionSuggestedDoc, latestLocationPath);
      } while (redirects[latestLocationPath] && (--iter > 0));

      latestVersionSuggestedDoc = latestVersionSuggestedDoc.replace(/\/index$/, '');
      //console.log("Updated banner link: %s --> %s", locationPath, latestVersionSuggestedDoc);

    } else {
      mainDoc = getVersionMainDoc(latestVersionSuggestion);
      latestVersionSuggestedDoc = mainDoc.path;
    }
  }
  
  return (
    <div
      className={clsx(
        className,
        ThemeClassNames.docs.docVersionBanner,
        'alert alert--warning margin-bottom--md',
      )}
      role="alert">
      <div>
        <BannerLabel siteTitle={siteTitle} versionMetadata={versionMetadata} />
      </div>
      <div className="margin-top--md">
        <LatestVersionSuggestionLabel
          versionLabel={latestVersionSuggestion.label}
          to={latestVersionSuggestedDoc}
          onClick={() => savePreferredVersionName(latestVersionSuggestion.name)}
        />
      </div>
    </div>
  );
}
export default function DocVersionBanner({className}) {
  const versionMetadata = useDocsVersion();
  if (versionMetadata.banner) {
    return (
      <DocVersionBannerEnabled
        className={className}
        versionMetadata={versionMetadata}
      />
    );
  }
  return null;
}
