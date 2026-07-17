import type { Graph } from 'schema-dts';

export const site = {
  url: 'https://chrisdothtml.github.io/qr/',
  repoUrl: 'https://github.com/chrisdothtml/qr',
  name: 'QR/GEN',
  title: 'Free QR Code Generator: No Ads, No Signup',
  description:
    'Generate a QR code from any link or text, free and instantly. Runs entirely in your browser; no ads, no signup, no tracking, no expiring codes.',
};

export const faq = [
  {
    question: 'Is this QR code generator really free?',
    answer:
      'Yes. There are no ads, no account, no watermark, and no paid tier. The project is open source under the MIT license.',
  },
  {
    question: 'Do the QR codes expire?',
    answer:
      'No, the generated codes are static; your link or text is encoded directly into the image, with no redirect service in between, so they work forever.',
  },
  {
    question: 'Is my data uploaded anywhere?',
    answer:
      'No. The QR code is generated entirely in your browser. Whatever you type never leaves your device.',
  },
  {
    question: 'How do I download the QR code?',
    answer:
      'Right-click the generated image and choose "Save image as..." (or long-press on mobile). It saves as a high-resolution PNG.',
  },
];

export const structuredData: Graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: site.name,
      url: site.url,
      description:
        'Free QR code generator that runs entirely in your browser. No ads, no signup, no tracking, no expiring codes.',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
};
