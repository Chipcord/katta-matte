import Sidebar from "@/app/components/Sidebar";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64">
        <Sidebar />
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
