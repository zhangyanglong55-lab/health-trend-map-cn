import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://health-trend-map-cn.zhangyanglong55.chatgpt.site"),
  title: "健康风向｜全国健康趋势地图",
  description: "蓝色健康科技风全国态势地图，融合公开疾病监测、天气与城市关联信号。",
  openGraph: {
    title: "健康风向｜全国健康趋势地图",
    description: "以全国地图为核心的健康趋势与城市关联可视化。",
    images: [{ url: "/og-v3.png", width: 1792, height: 896, alt: "健康风向全国天气健康态势" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "健康风向｜全国健康趋势地图",
    description: "以全国地图为核心的健康趋势与城市关联可视化。",
    images: ["/og-v3.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
