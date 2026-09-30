import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>katta-matte.no</h1>

      <h2>Hopp rett inn i læringen</h2>
      <Link href="/learn/1T/1/1">1T Matte</Link>
      <Link href="/learn/R1/1/1">R1 Matte</Link>
    </div>
  );
}
