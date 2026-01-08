import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow Requests - Simplify API Testing and Workflow Automation",
  description:
    "Flow Requests revolutionizes how you handle complex API workflows. Whether you're a developer or QA engineer, our platform makes testing intricate flows effortless with visual builders, imports, and no-code automation.",
  keywords: [
    "nocode",
    "workflow",
    "n8n",
    "zapier",
    "automations",
    "api",
    "rest",
    "restful",
    "Insomnia",
    "Postman",
    "Bruno",
    "Apidog",
    "Requestly",
    "Dev tool",
    "QA tool",
    "developer",
    "QA",
    "API testing",
    "workflow automation",
    "visual workflow builder",
    "import collections",
    "plugins",
    "real-time testing",
    "export import",
    "no data storage",
    "API integration",
    "no-code automation",
    "combine collections",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
