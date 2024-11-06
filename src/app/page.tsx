// app/page.tsx

import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Main from '@/components/dashboard/MainDashboard';
import LandingContent from '@/components/marketing/LandingContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "WGISTL - What's Good in St. Louis?",
  description: 'Amplifying the voices of those making a positive difference in St. Louis.',
};

export default async function Home() {
  const { userId } = auth();

  return (
    <>
      <Header />
      {!userId ? (
        <LandingContent />
      ) : (
        <main className="flex-column items-center justify-center relative p-8 rounded-lg border-b-2 m-10">
          <Main />
        </main>
      )}
    </>
  );
}