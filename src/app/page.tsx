import dynamic from 'next/dynamic';

const ViewerLayout = dynamic(() => import('@/components/ViewerLayout'), {
  ssr: false,
});

export default function Home() {
  return <ViewerLayout />;
}
