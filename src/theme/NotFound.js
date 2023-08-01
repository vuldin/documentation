import React, { useState, useRef, useEffect } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import { PageMetadata } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import sidebar from "../../sidebars"
import sidebarv21_11 from "../../versioned_sidebars/version-21.11-sidebars.json"
import sidebarv22_1 from "../../versioned_sidebars/version-22.1-sidebars.json"
import sidebarv22_2 from "../../versioned_sidebars/version-22.2-sidebars.json"
import sidebarv22_3 from "../../versioned_sidebars/version-22.3-sidebars.json"
import sidebarv23_1 from "../../versioned_sidebars/version-23.1-sidebars.json"

let hasSmartRedirected = false;
let smartRedirectPath;
let possibleNewRedirectRule;
let possibleRedirect;

//function to remove sections that are duplicated. Mainly in index pages. Example reference/rpk-acl/rpk-acl -> reference/rpk-acl
function removeDuplicateSections(url) {
  const sections = url.split('/'); // Split the URL into sections
  const uniqueSections = [...new Set(sections)]; // Remove duplicates using Set and spread syntax
  const cleanedUrl = uniqueSections.join('/'); // Reconstruct the URL with unique sections
  return cleanedUrl;
}

function getDocIds(data) {
  const docIds = [];

  function iterateDocs(items) {
    if (Array.isArray(items)) {
      items.forEach((obj) => {
        if (obj.type === "doc") {
          docIds.push(removeDuplicateSections(obj.id));
        }
        else if (obj.type === undefined){
          docIds.push(removeDuplicateSections(obj));
        }
        if (obj.items) {
          iterateDocs(obj.items);
        }
      });
    }
  }

  iterateDocs(data);

  return docIds;
}

function mapPathFileToCompleteURL(docIdsArray) {
  const map = new Map();

  for (let i = 0; i < docIdsArray.length; i++) {
    const path = docIdsArray[i];
    const lastIndex = path.lastIndexOf('/');
    const key = path.substring(lastIndex + 1);

    if(key !== "index"){
      map.set(key, path);
    }
  }
  return map;
}

function hasVersionNumber(url) {
  const segments = url.split('/');
  for (let segment of segments) {
    // Remove any URL encoding
    segment = decodeURIComponent(segment);
    // Check if the segment is a valid version number. Example 21.11
    if (/^\d+(\.\d+)*$/.test(segment)) {
      return segment;
    }
  }
  return null;
}

function findCloseURL (url,versionNumber){
  let docIdsArray;
  const versionedSidebars = new Map([
    ["21.11", sidebarv21_11],
    ["22.1", sidebarv22_1],
    ["22.2", sidebarv22_2],
    ["22.3", sidebarv22_3],
    ["23.1", sidebarv23_1],
  ]);
  //if it has a version number, extract the sidebar file of that version. If it can't find, throw version not found.
  if(versionNumber){
    if (versionedSidebars.has(versionNumber)) {
      docIdsArray = getDocIds(versionedSidebars.get(versionNumber).docsSidebar);
    }
    else{
      throw new Error("Version not found");
    }
  }
  else{
    docIdsArray = getDocIds(sidebar.docsSidebar);
  }
  const urlMap = mapPathFileToCompleteURL(docIdsArray);
  return urlMap.get(url);
}

function smartRedirect(){
  const originalPathName = window.location.pathname;
  const versionNumber = hasVersionNumber(originalPathName);
  const segments = originalPathName.split('/').filter(Boolean);
  const lastString = segments[segments.length - 1];
  const prefix = window.location.origin + '/docs/';
  let closeURL;
  let sessionStorageKey;
  
    if (versionNumber!==null) {
      try{
        closeURL=findCloseURL(lastString,versionNumber);
        possibleRedirect = prefix + versionNumber +'/'+ closeURL;
        sessionStorageKey= 'smartRedirectHasRun_'+versionNumber+'_'+lastString;
      }
      catch (error){
        return null;
      }
    }
    else{
      closeURL = findCloseURL(lastString);
      possibleRedirect = prefix + closeURL;
      sessionStorageKey = 'smartRedirectHasRun_'+lastString;
    }
    const hasRun = sessionStorage.getItem(sessionStorageKey);
    if(hasRun === null){
      sessionStorage.setItem(sessionStorageKey, true);
      if(closeURL !== undefined){
        hasSmartRedirected = true;
        smartRedirectPath = possibleRedirect;
        possibleNewRedirectRule = originalPathName + " " + "/docs/" + closeURL + " 301!";
      }
    }
  }

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

function executeRedirect (){
  if(hasSmartRedirected){
    window.location.href = possibleRedirect;
  }
}


const NotFoundForm = () => {
  let [formData, setFormData] = useState({});
  const handleSubmit = (e) => {
    smartRedirect();
    formData.date = new Date();
    formData.originalUrl = window.location.href;
    formData.hasSmartRedirected = hasSmartRedirected;
    formData.smartRedirectPath = smartRedirectPath;
    formData.possibleNewRedirectRule = possibleNewRedirectRule;

    setFormData({ ...formData });
    if(!window.location.href.includes("deploy-preview")){
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "notfoundForm",
        ...formData,
      }),
    })
      .then(() => {
        executeRedirect();
        console.log("Form successfully submitted");
      })
      .catch((error) => console.log(error));
  }};

  useEffect(() => {
    handleSubmit(SubmitEvent);
  }, []);

  return (
    <form
      data-netlify="true"
      name="notfoundForm"
      method="POST"
      onSubmit={handleSubmit}
      netlify-honeypot="bot-field"
    >
      <input
        className={styles.hide}
        type="hide"
        name="form-name"
        value="notfoundForm"
      />
      <p className={styles.hide}>
        <label>
          Beep-Boop. Bot-field <input name="bot-field" />
        </label>
      </p>
      <input className={styles.hide} name="originalUrl" />
      <input className={styles.hide} name="date" />
      <input className={styles.hide} name="hasSmartRedirected" />
      <input className={styles.hide} name="smartRedirectPath" />
      <input className={styles.hide} name="possibleNewRedirectRule" />
      <input className={styles.hide} type="submit" />
    </form>
  );
};

export default function NotFound() {
  return (
    <>
      <PageMetadata
        title={translate({
          id: "theme.NotFound.title",
          message: "Page Not Found",
        })}
      />
      <Layout>
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <NotFoundForm/>
              <h1 className="hero__title">
                <Translate
                  id="theme.NotFound.title"
                  description="The title of the 404 page"
                >
                  Page Not Found
                </Translate>
              </h1>
              <p>
                <Translate
                  id="theme.NotFound.p1"
                  description="The first paragraph of the 404 page"
                >
                  We could not find what you were looking for.
                </Translate>
              </p>
              <p>
                <Translate
                  id="theme.NotFound.p2"
                  description="The 2nd paragraph of the 404 page"
                >
                  Please contact the owner of the site that linked you to the
                  original URL and let them know their link is broken.
                </Translate>
              </p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
