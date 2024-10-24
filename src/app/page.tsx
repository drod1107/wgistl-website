// app/page.tsx
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import Header from './components/Header';
import Main from './components/main/page';
import LandingContent from './components/LandingContent';

export const metadata: Metadata = {
  title: 'WGISTL - What\'s Good in St. Louis?',
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