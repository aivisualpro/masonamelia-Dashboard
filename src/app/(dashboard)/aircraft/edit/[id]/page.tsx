import EditJet from '@/views/jets/EditJet';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditJetPage({ params }: PageProps) {
  return <EditJet id={params.id} />;
}
