import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "NFT Punks",
  description: "NFT Collection with Airdrop for Generative Art",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
          <Sidebar />
          <div className="flex flex-1 flex-col p-12 lg:col-span-6">
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
