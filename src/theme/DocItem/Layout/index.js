import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useWindowSize } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/theme-common/internal";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemContent from "@theme/DocItem/Content";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Icon from "@material-ui/core/Icon";
import ContributionIcon from "../../../../static/img/contribution.svg";
import { useLocation } from 'react-router-dom';

// Set mouseflow custom variable
// (See https://help.mouseflow.com/en/articles/4312070-custom-variables)
function setFeedbackType(type) {
  window._mfq = window._mfq || [];
  window._mfq.push(["setVariable", type, "true"]);
}

function createEditablePlaceholders () {
  const codeElements = document.querySelectorAll("pre > code");

  for (let i = 0; i < codeElements.length; i++) {
    const codeElement = codeElements[i];
    // Don't enable editable code for XML
    // TODO: selectively enable editable code for markup samples (XML, HTML, ...)
    if(codeElement.parentElement.closest('.theme-code-block')?.classList.contains('language-xml')){
      return
    }
    addEditableSpan(/&lt;.[^&A-Z]*&gt;/g, codeElement);
  }
}

if (!RegExp.escape) {
  RegExp.escape = function(s) {
    return s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
  };
}

function addEditableSpan(regex, element) {
  if (!element || !element.textContent) {
    return;
  }
  const text = element.innerHTML;
  const placeholders = text.match(regex) || [];
  const processed = new Set();
  let newHTML = text;
  for (const placeholder of placeholders) {
    const cleanedPlaceholder = placeholder.replace(/<[^>]*>/g, '').replace(/&lt;|&gt;/g, '');
    if (processed.has(placeholder)) {
      continue;
    }
    const regexString = RegExp.escape(placeholder);
    const globalRegex = new RegExp(regexString, 'g');
    newHTML = newHTML.replace(globalRegex, `<span contenteditable="true" data-type="${cleanedPlaceholder}">&lt;${cleanedPlaceholder}&gt;</span><span class="cursor"></span>`);
    processed.add(placeholder);
  }
  element.innerHTML = newHTML;
}

function addClasses () {
  const editablePlaceholders = document.querySelectorAll('[contenteditable="true"], [contenteditable="true"] span');

  editablePlaceholders.forEach((placeholder) => {
    placeholder.classList.add('editable');
    placeholder.addEventListener('input', function(event) {
      const dataType = event.target.dataset.type;
      const newText = event.target.textContent;

      document.querySelectorAll(`[data-type="${dataType}"][contenteditable="true"]`).forEach(span => {
        if (span !== event.target) {
          span.textContent = newText;
        }
      });
    });
  });
}

function addEvents() {
  const editablePlaceholders = document.querySelectorAll('[contenteditable="true"], [contenteditable="true"] span');

  editablePlaceholders.forEach((placeholder) => {
    placeholder.addEventListener('input', function(event) {
      const dataType = event.target.dataset.type;
      const newText = event.target.textContent;

      document.querySelectorAll(`[data-type="${dataType}"][contenteditable="true"]`).forEach(span => {
        if (span !== event.target) {
          span.textContent = newText;
          if (span.contentEditable == 'true') {
            span.nextElementSibling.classList.remove('cursor');
          } else {
            span.parentElement.nextElementSibling.classList.remove('cursor');
          }
        }
      });
    });
    placeholder.addEventListener('click', function(event){
      if (event.target.contentEditable == 'true') {
        event.target.nextElementSibling.classList.remove('cursor');
      } else {
        event.target.parentElement.nextElementSibling.classList.remove('cursor');
      }
    })
  });
}


function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const FeedbackForm = (props) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  let [formData, setFormData] = useState({})

 const handleFormData = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value })
 }

  let title,whatWeDo,easyRadio, solvedRadio,otherRadio;
  
  otherRadio = "Other";

  if(props.positiveFeedback){
    title = "What do you like about this doc?";
    solvedRadio = "Solved my problem";
    easyRadio = "Easy to understand";
    whatWeDo = "Let us know what we do well:";
  }
  else{
    title = "What did you not like about this doc?";
    solvedRadio = "Did not solve my problem";
    easyRadio = "Hard to understand";
    whatWeDo = "Let us know what we can improve:";
    
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const defaultRadio = solvedRadio;
    if(!formData.feedback){
      formData.feedback=defaultRadio;
    }
    const currentUrl = window.location.href
    const beta = window.location.href.includes('preview')
    let version = 'latest'; //TODO this should capture the value from docusaurus.config.js
    if(/\d/.test(currentUrl) && !beta){
      version = currentUrl.substring(currentUrl.indexOf("docs/")+5); 
      version = version.substring(0,version.indexOf("/"));
    }
    formData.version = version
    formData.url=currentUrl
    formData.positiveFeedback = props.positiveFeedback
    formData.beta = beta
    formData.date = new Date()
    formData.navigator = navigator.userAgent
    
    if (feedbackSubmitted) return;
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        'form-name': 'feedbackForm',
        ...formData
      })
    })
      .then(() => {
        console.log("Form successfully submitted")
        setFeedbackSubmitted(true)
        setTimeout(props.onClose,30000)
      })
      .catch((error) => console.log(error));
  };

  return (
    <form className={`${props.show ? `${styles.modal}` : `${styles.hide}`}`} data-netlify="true" name="feedbackForm" method="POST" onSubmit={handleSubmit}   netlify-honeypot="bot-field"
    >
      <div>
          <div className={styles.modalContent}>
        {!feedbackSubmitted ? (
          <div>
                <div className={styles.modalHeader}>
                  <h4>{title}</h4>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.radioButtons}>
                      <input type="hidden" name="form-name" value="feedbackForm"/>

                      <p className={styles.hide}>
                        <label className={styles.hide}>
                          Beep-Boop. Bot-field <input name="bot-field" />
                        </label>
                      </p>
                      <input className={styles.hide} name="version"/>
                      <input className={styles.hide} name="url"/>
                      <input className={styles.hide} name="positiveFeedback"/>
                      <input className={styles.hide} name="beta"/>
                      <input className={styles.hide} name="date"/>
                      <input className={styles.hide} name="navigator"/>

                      <label>
                        <input type="radio" name="feedback" id="solvedProblem" value={solvedRadio} onChange={handleFormData} defaultChecked/>
                        <span className={styles.labelMargin}>{solvedRadio}</span>
                      </label><br />
                      <label>
                        <input type="radio" name="feedback" id="easyToUnderstand" value={easyRadio} onChange={handleFormData}/>
                        <span className={styles.labelMargin} >{easyRadio}</span>
                      </label> <br />
                      <label>
                        <input type="radio" name="feedback" id="other" value="other" onChange={handleFormData} />
                        <span className={styles.labelMargin}>{otherRadio}</span>
                      </label><br/>
                    </div>
                    <div className={styles.boxSizing}>
                    Optional: Share your email address if we can contact you about your feedback.
                    </div>
                    <input type="text" name="email" id="email" onChange={handleFormData} placeholder="email@example.com" className={styles.moreQuestions}/><br />
                    <div>
                      <div className={`${`${styles.boxSizing} + " " + ${styles.padding}` }`}>
                        {whatWeDo}
                      </div>
                      <textarea id="otherText"  name="otherText"  rows="4"  cols="50"  placeholder="Please share details or suggestions for this topic." onChange={handleFormData}></textarea>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                {!feedbackSubmitted &&
                  <button type= "submit" onSubmit={handleSubmit} className={clsx("button", styles.submitButton)}>Submit</button>
                }
                </div>
              
            </div>): 
            
            (<div className={styles.modalBody}>
              <div className={styles.feedbackSubmitted}>
              <Icon className={styles.feedbackSubmittedIcon}>checkmark</Icon><br/>
              Thank you for submitting your feedback.
              <button onClick={props.onClose}  className={clsx("button", styles.closeButton)}>Close</button>
              </div>
              
            </div>)}
            
          </div>
          
      </div>
      </form>
  );
};

function displaySidebar(){
  var x = document.getElementById("contentSidebar");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();
  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;
  const mobile = canRender ? <DocItemTOCMobile /> : undefined;
  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;
  return {
    hidden,
    mobile,
    desktop,
  };
}
export default function DocItemLayout({ children,
  secondaryMenu }) {
  const docTOC = useDocTOC();
  const { metadata } = useDoc();
  const { editUrl } = metadata;
  const [show, setShow] = useState(false);
  const [positiveFeedback, setPositiveFeedback] = useState(true);
  let isDocsHome = false
  if(typeof window !== 'undefined') {
    const docsHomeUrlPattern = /\/docs\/[A-Za-z0-9.\/]*home/
    isDocsHome = docsHomeUrlPattern.test(window.location.href);
  }
  let isCloud =useLocation().pathname.includes("/deploy/deployment-option/cloud/") || useLocation().pathname.includes("/get-started/quick-start-cloud/");
  // Hide the feedback thumbs in the Toc when the user reaches the bottom of the page.
  useEffect(() => {
    document.addEventListener('scroll', function(e){
      let documentHeight = document.body.scrollHeight;
      let currentScroll = window.scrollY + window.innerHeight;
      // Wait until the user is [modifier]px from the bottom.
      let modifier = 300; 
      const feedback = document.getElementById('feedbackToc');
      if (!feedback) return
      if(currentScroll + modifier > documentHeight) {
          feedback.style.display = 'none';
      } else {
        feedback.style.display = 'block';
      }
    })
    // Put placeholders in code blocks (<[^>*]>) in editable <span> elements.
    const addPlaceholders = () => {
      try {
        createEditablePlaceholders();
        addClasses()
        addEvents()
      } catch (error) {
        console.error('An error occurred while making placeholders editable:', error);
      }
    }
    if (document.readyState === 'complete') {
      addPlaceholders()
    } else {
      window.addEventListener('load', addPlaceholders)
    }
  },[])
  return (
    <div className="row">
      <div className={clsx("col", !docTOC.hidden && styles.docItemCol)}>
      {!isCloud &&<DocVersionBanner />}
        <div className={styles.docItemContainer}>
          <article>
            {!isDocsHome && <DocBreadcrumbs />}
            {!isCloud && <DocVersionBadge />}
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <section className={styles.issueLinkSeparator}>
          <FeedbackForm onClose={() => setShow(false)} show={show} positiveFeedback={positiveFeedback}></FeedbackForm>
          <div className={clsx("row", styles.alignCenter)}>
            <div className={clsx("col", styles.feedBackSection + " " + styles.mailIcon)}>
              <div>
                Was this helpful?
              </div>
              <div>
                <button
                  className={
                    styles.mailIcon + " " + styles.thumbsUpSeparator
                  }
                  onClick={() => {setShow(true); setPositiveFeedback(true); setFeedbackType("positive-feedback");}}
                >
                  <Icon>thumb_up</Icon>
                </button>

                <button
                  className={
                    styles.mailIcon + " " + styles.thumbsUpSeparator
                  }
                  onClick={() => {setShow(true); setPositiveFeedback(false); setFeedbackType("negative-feedback");}}
                >
                  <Icon>thumb_down</Icon>
                </button>
              </div>
            </div>
            <div className="col">
              <a href="https://redpanda.com/slack" alt="Slack Community"><Icon className={styles.mailIcon}>group</Icon> Ask in the community</a>
            </div>
            <div className="col">
            <BrowserOnly>
              {() => (
              <a
                href={
                  "mailto:rp-docs-feedback@redpanda.com?subject=Documentation Feedback&body=Doc url: " +
                  window.location.href
                }
              >
                <Icon className={styles.mailIcon}>email</Icon>
                <span> Share your feedback</span>
              </a>
              )}
              </BrowserOnly>
            </div>
            <div className={clsx("col", styles.reportIssueText)}>
              <a
                href={editUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.contributionIcon}
              >
                <ContributionIcon />
                <span> Make a contribution</span>
              </a>
            </div>
          </div>
          </section>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && <div className={clsx("col col--3", styles.stickyToc)}>
      {docTOC.desktop}
      <div id="feedbackToc" className={clsx("col", styles.feedBackSection + " " + styles.mailIcon + " "+ styles.rightNavFeedback)}>
      <div>
        Was this helpful?
      </div>
      <div>
        <button
          className={
            styles.mailIcon + " " + styles.thumbsUpSeparator
          }
          onClick={() => {setShow(true); setPositiveFeedback(true);}}
        >
          <Icon>thumb_up</Icon>
        </button>

        <button
          className={
            styles.mailIcon + " " + styles.thumbsUpSeparator
          }
          onClick={() => {setShow(true); setPositiveFeedback(false);}}
        >
          <Icon>thumb_down</Icon>
        </button>
      </div>
    </div>
      </div>}
    </div>
  );
}