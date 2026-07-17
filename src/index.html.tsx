import { faq, site, structuredData } from './.data.ts';
import faviconSvg from './assets/favicon.svg';
import githubCornerSvg from './assets/github-corner.svg';

// `<` escaped so user-provided text can never close the script tag
const jsonLd = JSON.stringify(structuredData).replaceAll('<', '\\u003c');

export function Page() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{site.title}</title>
        <meta name="description" content={site.description} />
        <link rel="canonical" href={site.url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={site.title} />
        <meta property="og:description" content={site.description} />
        <meta property="og:url" content={site.url} />
        <meta name="twitter:card" content="summary" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`data:image/svg+xml,${encodeURIComponent(faviconSvg)}`}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="./index.css" />
      </head>
      <body>
        {/* https://github.com/tholman/github-corners; inlined (rather than
            an <img>) so the css hover animation can reach .octo-arm */}
        <a
          href={site.repoUrl}
          className="github-corner"
          aria-label="View source on Github"
          target="_blank"
          dangerouslySetInnerHTML={{ __html: githubCornerSvg }}
        />

        <header>
          <div className="logo-mark">
            QR<span>/</span>GEN
          </div>
        </header>

        <main>
          <p className="eyebrow">QR Code Generator</p>
          <h1>
            Turn any link or text
            <br />
            into a <em>scannable code.</em>
          </h1>

          <div className="input-row">
            <input
              id="data-input"
              type="text"
              placeholder="https://example.com or any text..."
              autoComplete="off"
              spellCheck={false}
            />
            <button id="generate-btn">Generate</button>
          </div>

          <div id="result">
            <div id="qr-wrapper">
              <div id="qr-output"></div>
            </div>
            <p className="save-hint">
              Right-click the image → "Save image as..." to download
            </p>
          </div>

          <section className="about">
            <h2>About this tool</h2>
            <p>
              This is a free QR code generator with no ads, no signup, and no
              tracking. Paste a link or type any text, hit Generate, and save
              the image — that's the whole product. Everything happens in your
              browser: the code is generated locally and whatever you enter
              never leaves your device. It's{' '}
              <a href={site.repoUrl} target="_blank">
                open source
              </a>{' '}
              and MIT licensed.
            </p>

            <h2>FAQ</h2>
            {faq.map(({ question, answer }) => (
              <div key={question} className="faq-block">
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </section>
        </main>

        <script type="module" src="./index.js"></script>
      </body>
    </html>
  );
}
