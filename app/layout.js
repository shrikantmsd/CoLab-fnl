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
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F0F0F0' }}>
        {children}
      </body>
    </html>
  );
}
