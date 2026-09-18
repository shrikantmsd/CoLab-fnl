export const metadata = {
  title: 'RAISA — Regulatory Affairs Intelligence System and Analytics',
  description: 'Global pharmaceutical regulatory submission intelligence. 128+ countries, AI document review, ICH M4Q(R2) ready.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F0F0F0' }}>
        {children}
      </body>
    </html>
  );
}
