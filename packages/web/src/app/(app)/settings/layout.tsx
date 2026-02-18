export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}
