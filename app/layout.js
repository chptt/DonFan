import './globals.css';

export const metadata = {
  title: 'DonFan - Web3 Donation Platform',
  description: 'Support your favorite influencers and their charitable causes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="charity-background pattern-overlay min-h-screen">
        <div className="floating-hearts">
          <div className="heart">❤️</div>
          <div className="heart">💚</div>
          <div className="heart">🤝</div>
          <div className="heart">❤️</div>
          <div className="heart">💙</div>
          <div className="heart">🤝</div>
          <div className="heart">💚</div>
          <div className="heart">❤️</div>
          <div className="heart">💙</div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
