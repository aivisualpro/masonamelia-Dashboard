// project imports
import dynamic from 'next/dynamic';
import Navigation from './Navigation';
import Loader from 'components/Loader';
const SimpleBar = dynamic(() => import('components/third-party/SimpleBar'), { ssr: false, loading: () => <Loader /> });
import { useGetMenuMaster } from 'api/menu';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      <div className='2xl:py-14 py-10'>
        <Navigation />
        {drawerOpen}
      </div>
    </>
  );
}
