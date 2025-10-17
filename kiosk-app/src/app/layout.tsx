// //kiosk-app/src/app/layout.tsx

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Attendance",
//   description: "Employee attendance tracking system",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">

//       <body className={`${inter.className} antialiased`}>
//         {children}
//       </body>
//     </html>
//   );
// }


// kiosk/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FingerprintSDKLoader from "@/components/FingerprintSDKLoader";
import FingerprintServiceCheck from "@/components/FingerprintServiceCheck";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Attendance Kiosk",
  description: "Employee attendance tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <FingerprintSDKLoader>
          <FingerprintServiceCheck />
          {children}
        </FingerprintSDKLoader>
      </body>
    </html>
  );
}