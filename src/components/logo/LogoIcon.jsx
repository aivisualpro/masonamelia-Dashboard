// material-ui
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';

const logoSrc = "/assets/images/logoIcon.avif";

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <>
      <Image style={{ maxWidth: "50px", height: "auto" }} src={logoSrc} alt="Mason Amelia" width={50} height={50} priority />
    </>
  );
}
