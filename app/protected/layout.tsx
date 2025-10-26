export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen w-full bg-[#0a0a0a]">{children}</main>;
}
