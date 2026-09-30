import Sidebar from "@/app/components/Sidebar";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <aside className="fixed left-0 top-0 h-screen w-80">
        <Sidebar />
      </aside>

      <main className="ml-80 flex justify-center">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
