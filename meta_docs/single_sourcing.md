# Single-sourcing with partials

Practice the DRY (Don't Repeat Yourself) principle by single-sourcing repeated content. Common examples of single-sourced content include prerequisites, contact info, and foundational steps of how-to guides.

Docusaurus supports single-sourcing with Markdown files that are importable in other files. While any page can be imported into any other page, our convention is that imported pages begin with an underscore `_`. Docusaurus calls those files **partials**. The Markdown content in a partial is rendered in a file that imports it. See [Docusaurus partial docs](https://docusaurus.io/docs/markdown-features/react#importing-markdown) for more info.

In Redpanda documentation, save partials in a `shared` folder, at the root of the directory that shares the same context. If the partial doc can be used in more contexts, go up one level in the file tree. For example, the `docs/deploy/kubernetes/shared` folder contains partials with k8s content that's imported by docs in `docs/deploy/kubernetes`; general partials are stored at `docs/shared` and used throughout the project.

Partials can be imported into other partials.

Example:

File `docs/deploy/shared/_markdown-partial-example.mdx`:

```javascript
<span>Hello {props.name}</span>
This is text some content from `_markdown-partial-example.mdx`.
```

The file that imports it must follow this syntax:

File `docs/deploy/use-example.mdx`:

```javascript
import PartialExample from './shared/_markdown-partial-example.mdx';
<PartialExample name="Redpanda Docs" />
```

The HTML output of the file `docs/deploy/use-example.mdx` will be:

```
Hello Redpanda Docs
This is text some content from _markdown-partial-example.md.
```

### Internal links in partials

To use internal links in partials, you must build relative paths according to the relative path of the page in which the partial is imported. Otherwise, relative links work only when partials are included in a page inside a specific folder: they are relative to that specific folder.

To build relative paths:

1. [Find the root-relative path](#find-the-root-relative-path) of your source page.
2. [Build the relative path](#build-the-relative-path) in the partial.
3. [Import the partial](#import-the-partial) into the source page.

#### Find the root-relative path

The first step is to find the relative path **to the root of the documentation** from the page in which you want to import a partial.

For example, you want to import a partial into a page called `tiered-storage.mdx` inside the `manage` folder.

```
.
├── manage
│   └── tiered-storage.mdx
```

The `.` represents the root of the documentation. This could be the `/docs` folder 
or a versioned folder such as `versioned_docs/version-22.3`.

The `tiered-storage.mdx` page is two levels below the root. In a relative path, two levels is written as `../../`, 
where `../` represents one level. This path is called the root-relative path.

In the frontmatter of the `tiered-storage.mdx` page, add your root-relative path to the `linkRoot` key.

```
---
title: Set Up Tiered Storage in Linux
linkRoot: ../../
---
```

#### Build the relative path

Now, you're ready to build relative paths inside a partial. For this example, we'll use the `_enterprise-license` file as a partial:

```
.
├── manage
│   └── tiered-storage.mdx
└── shared
    └── _enterprise-license.mdx
```


```mdx
:::info
This feature requires an [Enterprise license](./get-started/licenses).
:::
```

If you were to import this partial into the `tiered-storage.mdx` page, it wouldn't work because the relative path is wrong. The relative path would resolve to `/manage/get-started/licenses`, which doesn't exist.

```
.
├── get-started
│   └── licenses.mdx
├── manage
│   └── tiered-storage.mdx
└── shared
    └── _enterprise-license.mdx
```

Instead, you must build the path using the value of the `linkRoot` key that you added to the `tiered-storage.mdx` page.

```
import Link from '@docusaurus/Link';

:::info
This feature requires an <Link to={props.frontmatter && props.frontmatter.linkRoot + 'get-started/licenses'}>Enterprise license</Link>.
:::
```

The [`<Link>`](https://docusaurus.io/docs/docusaurus-core#link) component allows you to build a custom path using the source page's (`tiered-storage.mdx`) frontmatter, which includes the `linkRoot` key.

`props.frontmatter &&` checks that the frontmatter exists.

The path consists of two parts:

`props.frontmatter.linkRoot + 'get-started/licenses'`

`props.frontmatter.linkRoot` is the source page's root-relative path. `get-started/licenses` is the path from the root to the target page, which in this case is `get-started/licenses`.

Now that you have built the relative links inside the partial, you're ready to import it into the source page.

#### Import the partial

The final step is to import the partial into the source page and pass the page's frontmatter to the partial component.

```
---
title: Set Up Tiered Storage in Linux
linkRoot: ../../
---

import EnterpriseLicenseNote from '@site/docs/shared/_enterprise-license.mdx'

<EnterpriseLicenseNote frontmatter={frontMatter}/>
```

:::note
`frontMatter` inside the curly braces (`{}`) must use camel case.
:::

When Docusaurus builds the site, your partial is imported into the page and the relative links are built using the value of the `linkRoot` key.

To use the `_enterprise-license.mdx` partial in any other page, you just need to add the `linkRoot` key to the page's frontmatter and pass it to the partial component:

```
---
title: Some Other Page that is Deeply Nested
linkRoot: ../../../../
---

import EnterpriseLicenseNote from '@site/docs/shared/_enterprise-license.mdx'

<EnterpriseLicenseNote frontmatter={frontMatter}/>
```

### Limitations :warning:

**Headings**: Currently, Docusaurus has a limitation in which the table of contents (the right navigation pane) doesn't import headings in partials. See [Docusaurus open issue](https://github.com/facebook/docusaurus/issues/3915) for details. There is no known workaround.
 
### Examples of partials in Redpanda documentation

- rpk version

    Partial: [docs/get-started/shared/_rpk-version.mdx](https://github.com/redpanda-data/documentation/blob/dev/docs/get-started/shared/_rpk-version.mdx)

    Imported: [docs/get-started/shared/_install-rpk-homebrew.mdx](https://github.com/redpanda-data/documentation/blob/dev/docs/get-started/shared/_install-rpk-homebrew.mdx)

- yaml value
 
    Partial: [docs/manage/kubernetes/shared/_values-yaml.mdx](https://github.com/redpanda-data/documentation/blob/dev/docs/manage/kubernetes/shared/_values-yaml.mdx)

    Imported: [docs/manage/kubernetes/configure-storage.mdx](https://github.com/redpanda-data/documentation/blob/dev/docs/manage/kubernetes/configure-storage.mdx)