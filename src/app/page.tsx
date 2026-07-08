import dynamic from 'next/dynamic';

const ViewerLayout = dynamic(() => import('@/features/dicom-viewer/components/ViewerLayout'), {
  ssr: false,
});

export default function Home({ searchParams }: { searchParams: { studyId?: string } }) {
  return <ViewerLayout studyId={searchParams.studyId} />;
}
