import React from 'react';

// React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree
// into <head>. This lets each route own its title/description/canonical
// without react-helmet. Googlebot executes JS, so it reads these after render.
const SITE_URL = 'https://www.jamesgeorgemusic.com';
const DEFAULT_TITLE = 'James George Music | Professional Musician & Entertainer';

function Seo({ title, description, path = '', noindex = false }) {
  const canonical = `${SITE_URL}${path}`;

  // Note: og:* tags stay static in index.html because social scrapers do not
  // execute JS. Per-route OG previews would require SSR/prerendering.
  return (
    <>
      <title>{title ?? DEFAULT_TITLE}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow'}
      />
    </>
  );
}

export default Seo;
