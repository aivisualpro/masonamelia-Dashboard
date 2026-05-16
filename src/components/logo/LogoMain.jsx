// material-ui
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';

const logoSrc = "/logowhite.svg";

export default function LogoMain() {
  const theme = useTheme();
  return (
    <>
      <Image style={{ maxWidth: "200px", height: "auto", marginTop: 60 }} src={logoSrc} alt="Mason Amelia" width={200} height={60} priority />
    </>
  );
}
